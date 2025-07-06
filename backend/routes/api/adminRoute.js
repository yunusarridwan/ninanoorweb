// src/routes/api/adminRoute.js
import express from 'express';
import auth from '../../middleware/auth.js'; // Middleware autentikasi generik
import requireAdmin from '../../middleware/requireAdmin.js';     // Middleware otorisasi admin
import requireSuperAdmin from '../../middleware/requireSuperAdmin.js'; // Middleware otorisasi superadmin

// Import controller functions untuk Admin
import adminController from '../../controllers/adminController.js';

const router = express.Router();
// --- Route Pengelolaan Admin ---

// Route untuk mendapatkan semua admin (Admin atau Superadmin bisa mengakses)
// @route GET /api/admin/admins
// @access Private (Admin/Superadmin)
router.get('/admins', auth, requireAdmin, adminController.getAllAdmins);

// Route untuk mendapatkan admin berdasarkan ID (Admin atau Superadmin bisa mengakses)
// @route GET /api/admin/admins/:id
// @access Private (Admin/Superadmin)
router.get('/admins/:id', auth, requireAdmin, adminController.getAdminById);

// Route untuk membuat admin baru (Hanya Superadmin yang bisa mengakses)
// @route POST /api/admin/admins
// @access Private (Superadmin)
router.post('/admins', auth, requireSuperAdmin, adminController.createAdmin);

// Route untuk memperbarui admin (Hanya Superadmin yang bisa mengakses)
// @route PUT /api/admin/admins/:id
// @access Private (Superadmin)
router.put('/admins/:id', auth, requireSuperAdmin, adminController.updateAdmin);

// Route untuk menghapus admin (Hanya Superadmin yang bisa mengakses)
// @route DELETE /api/admin/admins/:id
// @access Private (Superadmin)
router.delete('/admins/:id', auth, requireSuperAdmin, adminController.deleteAdmin);

export default router;
