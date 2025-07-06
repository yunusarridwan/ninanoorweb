// routes/categoryRoutes.js
import express from 'express';
import categoryController from '../controllers/categoryController.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/multer.js'; // <-- Impor konfigurasi multer Anda di sini
import requireAdmin from '../middleware/requireAdmin.js';

const categoryRouter = express.Router();

// --- Category Routes ---

// @route   POST /api/categories
// @desc    Add a new category with an image upload
// @access  Private (Admin)
// Gunakan instance 'upload' yang sudah dikonfigurasi
categoryRouter.post('/', auth, requireAdmin, upload.single('image'), categoryController.addCategory);

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
categoryRouter.get('/', categoryController.listCategories);

// @route   GET /api/categories/:id
// @desc    Get a single category by ID
// @access  Public
categoryRouter.get('/:id', categoryController.getCategoryById);

// @route   PUT /api/categories/:id
// @desc    Update a category by ID with an optional new image
// @access  Private (Admin)
// Gunakan instance 'upload' yang sudah dikonfigurasi
categoryRouter.put('/:id', auth, upload.single('image'), categoryController.updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Remove a category by ID
// @access  Private (Admin)
categoryRouter.delete('/:id', auth, categoryController.removeCategory);

export default categoryRouter;