// src/routes/reviewRoutes.js
import express from 'express';

import { 
    createReview, 
    getProductReviews, 
    getUserReviews, 
    getAllReviewsAdmin, 
    updateReviewStatus, 
    deleteReview ,
    getUserReviewsByUserId,
    getApprovedReviews
} from '../controllers/reviewController.js';
import auth from '../middleware/auth.js'; // Pastikan path ini benar jika Anda mengimpor auth saja
import requireAdmin from '../middleware/requireAdmin.js'; // Pastikan path ini benar

const reviewRouter = express.Router();

// Public routes (siapa saja bisa melihat ulasan produk yang disetujui)
reviewRouter.get('/product/:productId', getProductReviews);

reviewRouter.get('/user-specific', auth, getUserReviewsByUserId); // <-- ROUTE BARU

// User routes (membutuhkan otentikasi)
// Pastikan `upload.none()` ditambahkan di sini, sebelum `createReview`
reviewRouter.post('/', auth, createReview); // Membuat ulasan

reviewRouter.get('/user/:userId', auth, getUserReviews); // Melihat ulasan pribadi atau ulasan user lain (admin)

reviewRouter.get('/approved', getApprovedReviews); 

// Admin routes (membutuhkan otentikasi admin)
reviewRouter.get('/admin', auth, requireAdmin, getAllReviewsAdmin); // Mendapatkan semua ulasan (untuk admin)
reviewRouter.put('/admin/:id/status', auth, requireAdmin, updateReviewStatus); // Mengubah status ulasan
reviewRouter.delete('/admin/:id', auth, requireAdmin, deleteReview); // Menghapus ulasan

export default reviewRouter;
