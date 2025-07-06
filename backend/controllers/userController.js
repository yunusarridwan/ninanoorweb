import validator from "validator";
import userModel from "../models/userModel.js"; // Pastikan path ini sesuai
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Function untuk membuat token JWT
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Konfigurasi Transporter untuk email (gunakan App Password Gmail atau SMTP lain)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// @desc    Register new user
// @route   POST /api/user/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { username, email, password, telpn } = req.body; // Menggunakan 'username'

        // Validasi username
        if (!username || username.trim().length < 3) {
            return res.status(400).json({ success: false, message: "Username harus minimal 3 karakter" });
        }

        // Validasi email
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Alamat email tidak valid" });
        }

        // Validasi password
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password harus minimal 6 karakter" });
        }

        // Validasi nomor telepon
        if (!telpn || !/^[0-9]{10,15}$/.test(telpn)) { // Memastikan telpn ada dan formatnya benar
            return res.status(400).json({ success: false, message: "Nomor telepon tidak valid" });
        }

        // Cek apakah user sudah terdaftar (email atau telpn sudah ada)
        const existingUser = await userModel.findOne({ $or: [{ email }, { telpn }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email atau Nomor Telepon sudah digunakan" });
        }

        // Hash password dengan bcryptjs
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Simpan user baru ke database
        const newUser = new userModel({
            username, // Menggunakan 'username'
            email,
            telpn,
            password: hashedPassword,
            items: {}, // Inisialisasi items sebagai objek kosong, sesuai default di skema
        });
        const user = await newUser.save();

        // Buat token untuk user
        const token = createToken(user._id);
        res.status(201).json({ success: true, token, user: { id: user._id, username: user.username, email: user.email } }); // Mengembalikan username
    } catch (error) {
        console.error("Error during user registration:", error);
        // Tangani error duplikat key Mongo spesifik
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ success: false, message: `${field.charAt(0).toUpperCase() + field.slice(1)} sudah digunakan.` });
        }
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// @desc    Login user
// @route   POST /api/user/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cek apakah user terdaftar
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User tidak terdaftar" });
        }

        // Cek apakah password sesuai
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Password tidak valid" });
        }

        // Pastikan model user Anda memiliki properti 'role'.
        // Jika tidak, Anda bisa menambahkan default role 'user' di sini atau di skema model.
        const userRole = user.role || 'user'; // Mengambil role dari objek user, atau default ke 'user'

        // Buat token dengan tambahan username DAN role
        const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username,
                role: userRole // <-- TAMBAHKAN ATAU KOREKSI BARIS INI
            }, 
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Mengembalikan token dan data user (sertakan role juga untuk konsistensi di frontend)
        res.status(200).json({ 
            success: true, 
            token, 
            user: { 
                id: user._id, 
                username: user.username, 
                email: user.email,
                role: userRole // <-- Opsional: Mengembalikan role ke frontend
            } 
        });
    } catch (error) {
        console.error("Error during user login:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// @desc    Forgot password (send reset link)
// @route   POST /api/user/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log("Received email for forgot password:", email);
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "Email tidak terdaftar. Silakan daftar terlebih dahulu." });
        }

        // Buat token reset password yang singkat
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

        // Link reset password (sesuaikan dengan URL frontend Anda)
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`; // Gunakan variabel env untuk URL frontend

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Reset Password Anda",
            html: `<p>Anda menerima email ini karena Anda (atau orang lain) telah meminta reset password untuk akun Anda.</p>
                   <p>Silakan klik link berikut, atau salin dan tempel ke browser Anda untuk menyelesaikan prosesnya:</p>
                   <a href="${resetLink}">Reset Password</a>
                   <p>Link ini akan kedaluwarsa dalam 15 menit.</p>
                   <p>Jika Anda tidak meminta ini, abaikan email ini dan password Anda akan tetap sama.</p>`,
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Email reset password telah dikirim! Cek inbox Anda." });
    } catch (error) {
        console.error("Error sending reset password email:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// @desc    Reset password
// @route   POST /api/user/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        // Validasi password baru
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password baru harus minimal 6 karakter" });
        }

        // Verifikasi token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Hash password baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password user di database
        const user = await userModel.findByIdAndUpdate(decoded.id, { password: hashedPassword }, { new: true });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.json({ success: true, message: "Password berhasil direset!" });
    } catch (error) {
        console.error("Error resetting password:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ success: false, message: "Token tidak valid." });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ success: false, message: "Token telah kedaluwarsa." });
        }
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// @desc    Get all users (for admin/superadmin view)
// @route   GET /api/user/all
// @access  Private (Admin/Superadmin) - Anda akan menggunakan middleware otorisasi di route
const getUsers = async (req, res) => {
    try {
        // Hanya ambil field yang diperlukan dan jangan sertakan password atau items yang besar
        const users = await userModel.find().select('-password -items');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        console.error("Error getting all users:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// @desc    Get user by ID (for admin/superadmin view or user's own profile)
// @route   GET /api/user/:id
// @access  Private (User's own ID or Admin/Superadmin) - Anda akan menggunakan middleware otorisasi di route
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Cek apakah user ada di database
        const user = await userModel.findById(id).select('-password'); // Jangan sertakan password
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid User ID format' });
        }
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// @desc    Update user profile
// @route   PUT /api/user/:id
// @access  Private (User's own ID or Superadmin)
const updateUser = async (req, res) => {
    const { username, email, telpn, password } = req.body;
    const { id } = req.params;

    try {
        let user = await userModel.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Periksa otorisasi: User hanya bisa update profilnya sendiri, atau superadmin bisa update siapapun
        if (req.user.id !== id && req.user.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Forbidden: You are not authorized to update this user.' });
        }

        // Periksa jika email atau telpn diubah ke yang sudah ada (kecuali milik user itu sendiri)
        if (email && email !== user.email) {
            const existingUser = await userModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email sudah digunakan oleh user lain.' });
            }
        }
        if (telpn && telpn !== user.telpn) {
            const existingUser = await userModel.findOne({ telpn });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Nomor telepon sudah digunakan oleh user lain.' });
            }
        }

        // Update field yang disediakan
        user.username = username || user.username;
        user.email = email || user.email;
        user.telpn = telpn || user.telpn;

        // Jika password disediakan, hash password baru
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ success: false, message: "Password baru harus minimal 6 karakter" });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await user.save();

        // Jangan kirim password di response
        const { password: userPassword, ...userData } = updatedUser._doc;

        res.status(200).json({ success: true, message: 'User updated successfully', data: userData });
    } catch (error) {
        console.error('Error updating user:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid User ID format' });
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/user/:id
// @access  Private (User's own ID or Superadmin)
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Periksa otorisasi: User hanya bisa menghapus akunnya sendiri, atau superadmin bisa menghapus siapapun
        if (req.user.id !== id && req.user.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Forbidden: You are not authorized to delete this user.' });
        }

        await userModel.deleteOne({ _id: id });

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid User ID format' });
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


export { registerUser, loginUser, forgotPassword, resetPassword, getUsers, getUserById, updateUser, deleteUser };
