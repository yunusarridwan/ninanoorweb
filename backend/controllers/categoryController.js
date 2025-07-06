// src/controllers/categoryController.js
import categoryModel from '../models/categoryModel.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from "cloudinary"; // Import Cloudinary

// Import adminModel jika Anda perlu mengakses data admin terkait
import adminModel from '../models/adminModel.js'; 


// @desc    Add new category
// @route   POST /api/categories
// @access  Private (Admin/Superadmin)
const addCategory = async (req, res) => {
  console.log("\n--- CATEGORY CONTROLLER: addCategory START ---"); // Log Awal Controller
  console.log("CATEGORY CONTROLLER DEBUG: req.user (from auth middleware):", req.user); // Log req.user
  console.log("CATEGORY CONTROLLER DEBUG: req.file (from multer):", req.file); // Log req.file (untuk debugging multer)
  console.log("CATEGORY CONTROLLER DEBUG: req.body:", req.body); // Log req.body

  try {
    const { name, description } = req.body;
    const image = req.file;

    // Pastikan req.user ada dari middleware auth
    if (!req.user || !req.user._id) {
        console.error("CATEGORY CONTROLLER ERROR: req.user or req.user._id missing.");
        return res.status(401).json({ success: false, message: "Unauthorized: Admin ID not found in request." });
    }

    if (!name) {
      return res.status(400).json({ success: false, message: "Nama kategori wajib diisi." });
    }

    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: "Kategori dengan nama ini sudah ada." });
    }

    let imageUrl = '';
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image.path, { resource_type: "image" });
        imageUrl = uploadResponse.secure_url;
        console.log("CATEGORY CONTROLLER DEBUG: Cloudinary upload successful. URL:", imageUrl);
      } catch (uploadError) {
        console.error("CATEGORY CONTROLLER ERROR: Error uploading category image to Cloudinary:", uploadError);
        return res.status(500).json({ success: false, message: "Gagal mengunggah gambar kategori." });
      }
    } else {
        console.warn("CATEGORY CONTROLLER DEBUG: No image file provided for category.");
        // Jika gambar wajib, Anda bisa tambahkan validasi di sini
        return res.status(400).json({ success: false, message: "Gambar kategori wajib diisi." }); // Ini penting jika gambar wajib
    }

    const newCategory = new categoryModel({
      name,
      description,
      image: imageUrl, // Simpan URL gambar dari Cloudinary
      createdBy: req.user._id, // Diambil dari token yang sudah diverifikasi oleh auth middleware
      updatedBy: req.user._id, // Diambil dari token yang sudah diverifikasi oleh auth middleware
    });
    const category = await newCategory.save();

    console.log("CATEGORY CONTROLLER SUCCESS: Kategori berhasil ditambahkan.", category._id);
    res.status(201).json({ success: true, message: "Kategori berhasil ditambahkan", category });
  } catch (error) {
    console.error("CATEGORY CONTROLLER GLOBAL CATCH ERROR:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  } finally {
    console.log("--- CATEGORY CONTROLLER: addCategory END ---\n"); // Log Akhir Controller
  }
};
// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const listCategories = async (req, res) => {
  try {
    // Populate createdBy dan updatedBy dengan data admin
    const categories = await categoryModel.find({})
      .populate('createdBy', 'name email') 
      .populate('updatedBy', 'name email'); 

    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    console.error("Error listing categories:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Format ID Kategori tidak valid.' });
    }

    const category = await categoryModel.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!category) {
      return res.status(404).json({ success: false, message: "Kategori tidak ditemukan." });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error("Error getting category by ID:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin/Superadmin)
export const updateCategory = async (req, res) => { // <-- Add 'export' here
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const image = req.file; 

    if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: "Unauthorized: Admin ID not found in request." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Format ID Kategori tidak valid.' });
    }

    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Kategori tidak ditemukan." });
    }

    if (name && name !== category.name) {
      const existingCategory = await categoryModel.findOne({ name });
      if (existingCategory && existingCategory._id.toString() !== id) {
        return res.status(400).json({ success: false, message: "Kategori dengan nama ini sudah ada." });
      }
    }

    let imageUrl = category.image; 
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image.path, { resource_type: "image" });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Error uploading new category image to Cloudinary:", uploadError);
        return res.status(500).json({ success: false, message: "Gagal mengunggah gambar kategori baru." });
      }
    }

    category.name = name || category.name;
    category.description = description || category.description;
    category.image = imageUrl;
    category.updatedBy = req.user._id; 

    await category.save();

    res.status(200).json({ success: true, message: "Kategori berhasil diperbarui.", category });

  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, message: "Kesalahan server saat memperbarui kategori.", error: error.message });
  }
};

// @desc    Remove category
// @route   DELETE /api/categories/:id
// @access  Private (Admin/Superadmin)
const removeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Format ID Kategori tidak valid.' });
    }

    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Kategori tidak ditemukan." });
    }

    // Opsional: Hapus gambar dari Cloudinary sebelum menghapus kategori
    if (category.image) {
      const imageId = category.image.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(imageId);
        console.log(`Cloudinary image ${imageId} deleted.`);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
      }
    }

    await categoryModel.deleteOne({ _id: id });

    res.status(200).json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error) {
    console.error("Error removing category:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Export semua fungsi sebagai satu objek
export default {
  addCategory,
  listCategories,
  getCategoryById,
  updateCategory,
  removeCategory,
};