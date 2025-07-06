// controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import adminModel from '../models/adminModel.js'; // Pastikan path ini sesuai

// Fungsi untuk menghasilkan token JWT
// Menggunakan admin._id langsung dari database
const generateToken = (id, role, email) => {
  return jwt.sign({ id, role, email }, process.env.JWT_SECRET, {
    expiresIn: '7d', 
  });
};

// @desc    Authenticate admin & get token
// @route   POST /api/auth/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari admin di koleksi Admin database (termasuk superadmin pertama)
    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid credentials: Email not found.' });
    }

    // Bandingkan password (setelah di-hash)
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials: Incorrect password.' });
    }

    // Jika berhasil, generate token untuk admin dari database
    // admin._id adalah ObjectId Mongoose yang valid
    const token = generateToken(admin._id, admin.role, admin.email);

    res.json({
      success: true,
      message: 'Admin logged in successfully',
      token,
      admin: {
        id: admin._id, // Sekarang selalu ID yang valid dari database
        email: admin.email,
        role: admin.role,
        name: admin.name,
      },
    });

  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
