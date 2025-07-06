// src/controllers/adminController.js
import mongoose from 'mongoose';
import adminModel from '../models/adminModel.js'; // Pastikan path ini sesuai
import bcrypt from 'bcryptjs'; // Import bcryptjs untuk hashing password

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Private (Admin/Superadmin)
const getAllAdmins = async (req, res) => {
  try {
    // Hanya ambil field yang diperlukan dan jangan sertakan password
    const admins = await adminModel.find().select('-password');
    res.status(200).json({ success: true, count: admins.length, data: admins });
  } catch (error) {
    console.error('Error getting all admins:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get single admin by ID
// @route   GET /api/admin/admins/:id
// @access  Private (Admin/Superadmin)
const getAdminById = async (req, res) => {
  try {
    const admin = await adminModel.findById(req.params.id).select('-password');

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    console.error('Error getting admin by ID:', error);
    // Tangani jika ID tidak valid
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid Admin ID format' });
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Create a new admin
// @route   POST /api/admin/admins
// @access  Private (Superadmin only)
const createAdmin = async (req, res) => {
  const { name, email, telpn, password, role } = req.body;

  try {
    // Otorisasi: Hanya superadmin yang bisa membuat admin baru
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: "Forbidden: Only superadmins can create new admin accounts." });
    }

    // Cek apakah admin dengan email atau telpn sudah ada
    let adminExists = await adminModel.findOne({ $or: [{ email }, { telpn }] });

    if (adminExists) {
      if (adminExists.email === email) {
        return res.status(400).json({ success: false, message: 'Admin with this email already exists.' });
      }
      if (adminExists.telpn === telpn) {
        return res.status(400).json({ success: false, message: 'Admin with this phone number already exists.' });
      }
    }

    // Hash password sebelum menyimpan
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await adminModel.create({
      name,
      email,
      telpn,
      password: hashedPassword,
      role: (role && req.user.role === 'superadmin') ? role : 'admin',
    });

    // Jangan kirim password di response
    const { password: adminPassword, ...adminData } = admin._doc;

    res.status(201).json({ success: true, message: 'Admin created successfully', data: adminData });
  } catch (error) {
    console.error('Error creating admin:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Update an admin
// @route   PUT /api/admin/admins/:id
// @access  Private (Superadmin only, atau Admin bisa update dirinya sendiri)
const updateAdmin = async (req, res) => {
  const { name, email, telpn, password, role } = req.body;

  try {
    let admin = await adminModel.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Otorisasi: Hanya superadmin yang bisa mengupdate admin lain.
    // Admin biasa hanya bisa mengupdate akunnya sendiri.
    if (req.user.role !== 'superadmin' && req.user._id.toString() !== admin._id.toString()) {
        return res.status(403).json({ success: false, message: "Forbidden: You are not authorized to update this admin account." });
    }

    // Simpan nilai lama untuk logging (BARIS INI DIHAPUS JIKA TIDAK ADA LOGGING SAMA SEKALI)
    // const oldAdminData = { ...admin._doc };

    // Periksa jika email atau telpn diubah ke yang sudah ada (kecuali milik admin itu sendiri)
    if (email && email !== admin.email) {
      const existingAdmin = await adminModel.findOne({ email });
      if (existingAdmin && existingAdmin._id.toString() !== admin._id.toString()) {
        return res.status(400).json({ success: false, message: 'Email already in use by another admin.' });
      }
    }
    if (telpn && telpn !== admin.telpn) {
      const existingAdmin = await adminModel.findOne({ telpn });
      if (existingAdmin && existingAdmin._id.toString() !== admin._id.toString()) {
        return res.status(400).json({ success: false, message: 'Phone number already in use by another admin.' });
      }
    }

    // Update field yang disediakan
    admin.name = name !== undefined ? name : admin.name;
    admin.email = email !== undefined ? email : admin.email;
    admin.telpn = telpn !== undefined ? telpn : admin.telpn;

    // Jika password disediakan, hash password baru
    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    // Hanya superadmin yang bisa mengubah role admin lain
    if (req.user.role === 'superadmin' && role !== undefined) {
        admin.role = role;
    } else if (role !== undefined && req.user.role === 'admin' && req.user._id.toString() !== admin._id.toString()) {
        return res.status(403).json({ success: false, message: "Forbidden: You are not authorized to change another admin's role." });
    }

    const updatedAdmin = await admin.save();

    // Jangan kirim password di response
    const { password: adminPassword, ...adminData } = updatedAdmin._doc;

    res.status(200).json({ success: true, message: 'Admin updated successfully', data: adminData });
  } catch (error) {
    console.error('Error updating admin:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid Admin ID format' });
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Delete an admin
// @route   DELETE /api/admin/admins/:id
// @access  Private (Superadmin only)
const deleteAdmin = async (req, res) => {
  try {
    // Otorisasi: Hanya superadmin yang bisa menghapus admin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: "Forbidden: Only superadmins can delete admin accounts." });
    }

    const admin = await adminModel.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Cegah superadmin menghapus dirinya sendiri
    if (req.user._id.toString() === admin._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot delete your own account.' });
    }

    const deletedAdminName = admin.name; // Simpan nama admin untuk log (BARIS INI DIHAPUS JIKA TIDAK ADA LOGGING)
    await adminModel.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid Admin ID format' });
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


// Export semua fungsi sebagai satu objek
export default {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};