import mongoose from "mongoose";

// Sub-schema untuk setiap item harga/berat berdasarkan ukuran
const priceWeightSchema = new mongoose.Schema({
    size: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    weight: {
        type: Number,
        required: true,
        min: 0,
    },
}, { _id: false }); // _id: false agar tidak membuat _id otomatis untuk setiap item di array

const productSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
    },
    // Menggunakan categoryId sesuai dengan field yang Anda gunakan di frontend dan error sebelumnya
    categoryId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String, // URL gambar produk
        required: true,
    },
    prices: { 
        type: [priceWeightSchema], 
        required: true,
        validate: {
            validator: function(v) {
                // Pastikan 'v' adalah array, tidak kosong, dan setiap item punya size, price (number), dan weight (number)
                return Array.isArray(v) && v.length > 0 && v.every(item => 
                    item.size && 
                    typeof item.price === 'number' && 
                    item.price >= 0 && // Tambahkan validasi min 0 di sini juga
                    typeof item.weight === 'number' &&
                    item.weight >= 0 // Tambahkan validasi min 0 di sini juga
                );
            },
            message: 'Produk harus memiliki setidaknya satu ukuran, harga, dan berat yang valid.'
        }
    },
    popular: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['Active', 'Non-active'],
        default: 'Active',
        required: true
    },
}, {
    timestamps: true
});

const productModel = mongoose.models.Product || mongoose.model("Product", productSchema);

export default productModel;