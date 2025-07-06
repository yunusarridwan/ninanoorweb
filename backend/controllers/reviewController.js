// src/controllers/reviewController.js
import reviewModel from '../models/reviewModel.js';
import productModel from '../models/productModel.js'; // Untuk update average rating
import orderModel from '../models/orderModel.js'; // Import Order model Anda
import multer from 'multer';
import orderDetailModel from '../models/orderDetailModel.js';

const upload = multer();

// Fungsi bantuan untuk menghitung ulang average rating produk
const updateProductAverageRating = async (productId) => {
    try {
        const reviews = await reviewModel.find({ productId, status: 'approved' }); // Hanya ulasan yang disetujui
        let averageRating = 0;
        let numberOfReviews = reviews.length;

        if (numberOfReviews > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = totalRating / numberOfReviews;
        }

        await productModel.findByIdAndUpdate(productId, { 
            averageRating: parseFloat(averageRating.toFixed(1)), // Simpan 1 desimal, pastikan Number
            numberOfReviews: numberOfReviews 
        });
        console.log(`Product ${productId}: Updated averageRating=${averageRating.toFixed(1)}, numberOfReviews=${numberOfReviews}`);
    } catch (error) {
        console.error(`Error updating product average rating for ${productId}:`, error);
    }
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (User)
export const createReview = async (req, res) => {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user._id; // Diambil dari token oleh middleware auth

    try {
        // 1. Validasi: Apakah order ada dan statusnya "Selesai"?
        const order = await orderModel.findById(orderId);
        console.log('Order yang ditemukan:', order);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
        }

        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Anda tidak memiliki izin untuk mengulas pesanan ini.' });
        }

        // Periksa status pesanan. Hanya "Selesai" yang bisa diulas.
        if (order.status !== 'Selesai') {
            return res.status(400).json({ success: false, message: 'Pesanan belum selesai atau tidak memenuhi syarat untuk diulas.' });
        }

        // --- Perbaikan Utama: Ambil dokumen OrderDetail ---
        const orderDetail = await orderDetailModel.findOne({ orderId: order._id }); // Mengambil dokumen OrderDetail berdasarkan orderId
        console.log('OrderDetail yang ditemukan:', orderDetail); // Log ini harus muncul dan berisi data

        if (!orderDetail) {
            return res.status(404).json({ success: false, message: 'Detail pesanan tidak ditemukan untuk order ini.' });
        }

        // 2. Validasi: Apakah produk yang diulas ada di dalam pesanan ini?
        // Sekarang gunakan orderDetail.items karena 'items' ada di OrderDetail, bukan di Order
        const productInOrder = orderDetail.items.find(item => item.productId.toString() === productId.toString()); // <-- BARIS PERBAIKAN

        if (!productInOrder) {
            return res.status(400).json({ success: false, message: 'Produk ini tidak ada dalam pesanan yang selesai.' });
        }

        // 3. Validasi: Apakah pengguna sudah mengulas produk ini untuk pesanan ini?
        const existingReview = await reviewModel.findOne({
            userId,
            productId,
            orderId, // Gunakan orderId dari request
        });

        if (existingReview) {
            return res.status(400).json({ success: false, message: 'Anda sudah mengulas produk ini untuk pesanan ini.' });
        }

        // 4. Buat ulasan baru
        const review = await reviewModel.create({
            userId,
            productId,
            orderId,
            rating,
            comment,
            status: 'pending' // Set default pending untuk moderasi
        });

        res.status(201).json({
            success: true,
            message: 'Ulasan berhasil dikirim, Terima kasih atas ulasannya',
            review
        });

    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ success: false, message: 'Gagal membuat ulasan.', error: error.message });
    }
};

// @desc    Get all reviews for a specific product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
    try {
        // Hanya tampilkan ulasan yang sudah disetujui
        const reviews = await reviewModel.find({ productId: req.params.productId, status: 'approved' })
            .populate('userId', 'username') // Ambil username dari User model
            .sort({ createdAt: -1 }); // Ulasan terbaru di atas

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error('Error fetching product reviews:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil ulasan produk.', error: error.message });
    }
};

// @desc    Get reviews by a specific user
// @route   GET /api/reviews/user/:userId
// @access  Private (User/Admin) - User hanya bisa lihat ulasan sendiri
export const getUserReviews = async (req, res) => {
    try {
        const targetUserId = req.params.userId;

        // Jika user yang meminta adalah admin, mereka bisa melihat ulasan user manapun
        // Jika user yang meminta adalah user biasa, mereka hanya bisa melihat ulasan mereka sendiri
        if (req.user.role === 'user' && req.user._id.toString() !== targetUserId.toString()) {
            return res.status(403).json({ success: false, message: 'Anda tidak memiliki izin untuk melihat ulasan pengguna lain.' });
        }

        const reviews = await reviewModel.find({ userId: targetUserId })
            .populate('productId', 'name image') // Ambil nama dan gambar produk
            .populate('orderId', 'status') // Ambil status dari Order model
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil ulasan pengguna.', error: error.message });
    }
};

// @desc    Get all reviews (for Admin Dashboard)
// @route   GET /api/admin/reviews
// @access  Private (Admin)
export const getAllReviewsAdmin = async (req, res) => {
    try {
        // Admin bisa melihat semua ulasan, terlepas dari statusnya
        const reviews = await reviewModel.find()
            .populate('userId', 'username email')
            .populate('productId', 'name image')
            .populate('orderId', 'status orderNumber') // Ambil status dan orderNumber dari Order model
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error('Error fetching all reviews for admin:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil semua ulasan.', error: error.message });
    }
};

// @desc    Update review status (approve/reject) by Admin
// @route   PUT /api/admin/reviews/:id/status
// @access  Private (Admin)
export const updateReviewStatus = async (req, res) => {
    const { status } = req.body; // 'approved' atau 'rejected'
    const adminId = req.user._id;

    try {
        const review = await reviewModel.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Ulasan tidak ditemukan.' });
        }

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status tidak valid. Harus "approved" atau "rejected".' });
        }
        
        // Hanya update jika status berubah
        if (review.status !== status) {
            review.status = status; // Catat admin yang memproses
            await review.save();

            // Setelah status berubah menjadi approved/rejected, update rata-rata rating produk
            // Hanya update jika status BARU adalah 'approved' atau jika status LAMA adalah 'approved' dan sekarang diubah
            if (status === 'approved' || review.status === 'approved') {
                 await updateProductAverageRating(review.productId);
            }

            res.status(200).json({ success: true, message: `Status ulasan berhasil diperbarui menjadi ${status}.`, review });
        } else {
            res.status(200).json({ success: true, message: 'Status ulasan tidak berubah.', review });
        }

    } catch (error) {
        console.error('Error updating review status:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui status ulasan.', error: error.message });
    }
};

// @desc    Delete a review by Admin
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin)
export const deleteReview = async (req, res) => {
    try {
        const review = await reviewModel.findByIdAndDelete(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Ulasan tidak ditemukan.' });
        }

        // Setelah ulasan dihapus, update rata-rata rating produk
        await updateProductAverageRating(review.productId);

        res.status(200).json({ success: true, message: 'Ulasan berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus ulasan.', error: error.message });
    }
};

// @desc    Get reviews made by the authenticated user
// @route   GET /api/reviews/user-specific
// @access  Private (User)
export const getUserReviewsByUserId = async (req, res) => {
    try {
        const userId = req.user._id;
        // --- PERBAIKAN: Tambahkan .populate() untuk productId dan userId ---
        const reviews = await reviewModel.find({ userId: userId })
            .populate('productId', 'name image') // Populasikan productId dengan nama dan gambar
            .populate('userId', 'name email avatar'); // Populasikan userId dengan nama, email, dan avatar (jika ada)

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error('Error fetching user-specific reviews:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat ulasan pengguna.', error: error.message });
    }
};


// @desc    Mendapatkan ulasan yang disetujui terbaru (untuk tampilan public/testimonial)
// @route   GET /api/reviews/approved
// @access  Public
export const getApprovedReviews = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10; // Ambil limit dari query, default 10
        
        const reviews = await reviewModel.find({ status: 'approved' })
            .sort({ createdAt: -1 }) // Urutkan dari yang terbaru
            .limit(limit) // Batasi jumlah ulasan
            .populate('productId', 'name image') // Populasikan nama dan gambar produk
            .populate('userId', 'username'); // Populasikan nama dan avatar pengguna

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error('Error in getApprovedReviews:', error);
        res.status(500).json({ success: false, message: 'Gagal mendapatkan ulasan yang disetujui.', error: error.message });
    }
};