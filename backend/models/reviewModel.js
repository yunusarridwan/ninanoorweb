// src/models/reviewModel.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referensi ke model User
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Referensi ke model Product
        required: true,
    },
    // Menggunakan orderId sesuai dengan orderModel yang Anda berikan
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order', // Referensi ke model Order
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        message: 'Rating harus antara 1 dan 5.'
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 1000,
        message: 'Komentar tidak boleh lebih dari 1000 karakter.'
    },
    // Status ulasan (untuk moderasi oleh admin)
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending', // Default saat ulasan pertama dibuat
        required: true,
    }
}, {
    timestamps: true // createdAt dan updatedAt otomatis
});

// Tambahkan indeks untuk mempercepat query
reviewSchema.index({ productId: 1, userId: 1, orderId: 1 });
reviewSchema.index({ status: 1 });

const reviewModel = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default reviewModel;