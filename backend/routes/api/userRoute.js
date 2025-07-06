// routes/api/userRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getUsers,
  getUserById,
  updateUser, // Import fungsi update user
  deleteUser, // Import fungsi delete user
} from "../../controllers/userController.js";

// Impor middleware autentikasi dan otorisasi
import auth from '../../middleware/auth.js';
import requireAdmin from '../../middleware/requireAdmin.js';

// Impor adminLogin dari authController (karena sudah dipisah)
import { adminLogin } from '../../controllers/authController.js'; // Pastikan path ini benar

const router = express.Router();

// --- Rute Autentikasi & Reset Password (Public Access) ---
// @route POST /api/user/register
// @access Public
router.post("/register", registerUser);

// @route POST /api/user/login
// @access Public
router.post("/login", loginUser);

// @route POST /api/user/forgot-password
// @access Public
router.post("/forgot-password", forgotPassword);

// @route POST /api/user/reset-password/:token
// @access Public
router.post("/reset-password/:token", resetPassword);

// --- Rute Login Admin (Public Access, tapi akan mengarahkan ke authController) ---
// @route POST /api/user/admin-login (Menggunakan path yang lebih spesifik untuk login admin)
// @access Public
// Catatan: Ini adalah rute login untuk admin. Token yang dihasilkan akan digunakan
// untuk mengakses rute admin yang dilindungi di '/api/admin'.
router.post("/admin-login", adminLogin);


// --- Rute Pengelolaan User (Protected Access) ---

// @route GET /api/user/all
// @desc  Mendapatkan semua user (Hanya Admin atau Superadmin)
// @access Private (Admin/Superadmin)
router.get("/all", auth, requireAdmin, getUsers);

// @route GET /api/user/:id
// @desc  Mendapatkan user berdasarkan ID (User itu sendiri atau Admin/Superadmin)
// @access Private (User's own ID or Admin/Superadmin)
router.get("/:id", auth, getUserById); // Logika otorisasi ada di controller getUserById

// @route PUT /api/user/:id
// @desc  Memperbarui profil user (User itu sendiri atau Superadmin)
// @access Private (User's own ID or Superadmin)
router.put("/:id", auth, updateUser); // Logika otorisasi ada di controller updateUser

// @route DELETE /api/user/:id
// @desc  Menghapus user (User itu sendiri atau Superadmin)
// @access Private (User's own ID or Superadmin)
router.delete("/:id", auth, deleteUser); // Logika otorisasi ada di controller deleteUser


export default router;
