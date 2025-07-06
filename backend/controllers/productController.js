import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// Fungsi untuk menambahkan produk
const addProduct = async (req, res) => {
    try {
        const adminId = req.user?._id;
        // Ambil 'prices' (plural) dari body, dan 'categoryId'
        const { name, description, categoryId, popular, prices } = req.body; 
        const image = req.file;

        // Validasi input awal (sesuai dengan skema baru)
        if (!name || !description || !categoryId || !prices || !image || !adminId) {
            return res.status(400).json({ success: false, message: "Nama, deskripsi, ID kategori, harga/berat, gambar, dan ID admin harus diisi." });
        }

        const uploadResponse = await cloudinary.uploader.upload(image.path, { resource_type: "image" });
        const imageUrl = uploadResponse.secure_url;

        let parsedPricesArray;
        try {
            // Parsing array objek prices
            parsedPricesArray = JSON.parse(prices); 
        } catch (error) {
            console.error("Kesalahan saat parsing JSON prices:", error);
            return res.status(400).json({ success: false, message: "Format data harga/berat/ukuran tidak valid (bukan JSON yang benar)." });
        }
        
        // Validasi tambahan di backend sebelum menyimpan
        // Validator di skema sudah cukup kuat, tapi ini bisa jadi lapisan tambahan
        if (!Array.isArray(parsedPricesArray) || parsedPricesArray.length === 0) {
            return res.status(400).json({ success: false, message: "Produk harus memiliki setidaknya satu ukuran, harga, dan berat." });
        }
        for (const item of parsedPricesArray) {
            if (!item.size || item.size.trim() === "" || 
                typeof item.price !== 'number' || isNaN(item.price) || item.price < 0 ||
                typeof item.weight !== 'number' || isNaN(item.weight) || item.weight < 0) {
                return res.status(400).json({ success: false, message: `Detail ukuran '${item.size}' (harga/berat) tidak valid.` });
            }
        }

        const productData = {
            name,
            description,
            categoryId: categoryId, // Menggunakan categoryId sesuai skema
            image: imageUrl,
            prices: parsedPricesArray, // Menggunakan array objek prices
            popular: popular === "true", 
            adminId: adminId, 
        };

        const product = new productModel(productData);
        await product.save();

        res.status(201).json({ success: true, message: "Produk berhasil ditambahkan", product });
    } catch (error) {
        console.error("Kesalahan di addProduct:", error); 
        if (error.name === 'ValidationError') {
            let messages = Object.values(error.errors).map(val => val.message);
            if (error.errors.categoryId && error.errors.categoryId.kind === 'ObjectId') {
                messages.push("ID kategori tidak valid.");
            }
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: error.message || "Gagal menambahkan produk" });
    }
};

// Fungsi untuk memperbarui produk
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Produk tidak ditemukan." });
        }

        let imageUrl = product.image;
        if (req.file) {
            const uploadResponse = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
            imageUrl = uploadResponse.secure_url;
        }

        let updatedPricesArray = product.prices || []; 

        if (req.body.prices) { 
            try {
                updatedPricesArray = JSON.parse(req.body.prices); 
            } catch (error) {
                console.error("Format JSON 'prices' tidak valid saat update:", error);
                return res.status(400).json({ success: false, message: "Format data harga/berat/ukuran tidak valid." });
            }
        }
        
        if (!Array.isArray(updatedPricesArray) || updatedPricesArray.length === 0) {
            return res.status(400).json({ success: false, message: "Produk harus memiliki setidaknya satu ukuran, harga, dan berat." });
        }
        for (const item of updatedPricesArray) {
            if (!item.size || item.size.trim() === "" || 
                typeof item.price !== 'number' || isNaN(item.price) || item.price < 0 ||
                typeof item.weight !== 'number' || isNaN(item.weight) || item.weight < 0) {
                return res.status(400).json({ success: false, message: `Detail ukuran '${item.size}' (harga/berat) tidak valid.` });
            }
        }

        const updateFields = {
            name: req.body.name || product.name,
            description: req.body.description || product.description,
            categoryId: req.body.categoryId || product.categoryId,
            image: imageUrl,
            prices: updatedPricesArray,
            popular: req.body.popular !== undefined ? req.body.popular === "true" : product.popular,
            // --- ADD THIS LINE ---
            status: req.body.status || product.status, // Add status from req.body or keep existing
        };

        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            updateFields,
            { new: true, runValidators: true } 
        );

        res.status(200).json({ success: true, message: "Produk berhasil diperbarui", product: updatedProduct });
    } catch (error) {
        console.error("Kesalahan di updateProduct:", error);
        if (error.name === 'ValidationError') {
            let messages = Object.values(error.errors).map(val => val.message);
            if (error.errors.categoryId && error.errors.categoryId.kind === 'ObjectId') {
                messages.push("ID kategori tidak valid.");
            }
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: error.message || "Gagal memperbarui produk" });
    }
};

// Function untuk menghapus produk (tetap sama, sudah benar)
const removeProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: "ID Produk dibutuhkan" });

        const product = await productModel.findByIdAndDelete(id);
        if (!product) return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });

        res.status(200).json({ success: true, message: "Produk berhasil dihapus" });
    } catch (error) {
        console.error("Error in removeProduct:", error);
        res.status(500).json({ success: false, message: error.message || "Gagal menghapus produk" });
    }
};

// Function untuk mendapatkan daftar produk dengan pagination (tetap sama, sudah benar)
const listProduct = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const products = await productModel
            .find({})
            .limit(limit)
            .skip((page - 1) * limit)
            .populate('categoryId', 'name') // Menambahkan populate untuk mendapatkan nama kategori
            .populate('adminId', 'name email'); // Menambahkan populate untuk mendapatkan nama admin dan email

        const totalProducts = await productModel.countDocuments();

        // Sesuaikan format respons agar konsisten dengan frontend yang mengharapkan 'products'
        res.status(200).json({
            success: true,
            products, // Kirim array produk
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error("Error in listProduct:", error);
        res.status(500).json({ success: false, message: error.message || "Gagal mendapatkan daftar produk" });
    }
};

// Function untuk mendapatkan informasi produk berdasarkan ID (tetap sama, sudah benar)
const singleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Memastikan ID produk disediakan
        if (!id) {
            console.warn("singleProduct: Product ID is missing in request parameters.");
            return res.status(400).json({ success: false, message: "ID Produk dibutuhkan." });
        }

        // Mencari produk berdasarkan ID dan mempopulate data terkait
        const product = await productModel.findById(id)
            .populate('categoryId', 'name')
            .populate('adminId', 'name email');

        // Memeriksa apakah produk ditemukan
        if (!product) {
            console.log(`singleProduct: Product with ID ${id} not found.`);
            return res.status(404).json({ success: false, message: "Produk tidak ditemukan." });
        }

        // --- PENTING: Pengecekan Status Produk ---
        // Asumsi produk memiliki properti 'status' yang bisa bernilai 'nonactive'
        // Jika statusnya 'nonactive', kembalikan 404 (Not Found) untuk menyembunyikan keberadaannya
        if (product.status === 'Non-active') {
            console.log(`singleProduct: Access denied for non-active product ID ${id}.`);
            return res.status(404).json({ success: false, message: "Produk tidak ditemukan atau tidak tersedia." });
            // Atau, jika Anda ingin membedakan antara tidak ditemukan dan nonaktif, Anda bisa menggunakan 403 Forbidden:
            // return res.status(403).json({ success: false, message: "Anda tidak memiliki izin untuk melihat produk ini." });
        }

        // Jika produk ditemukan dan aktif, kirimkan detail produk
        console.log(`singleProduct: Successfully fetched active product ID ${id}.`);
        res.status(200).json({ success: true, product });

    } catch (error) {
        console.error("Error in singleProduct:", error.message, error.stack);
        // Tangani kesalahan MongoDB seperti CastError (ID tidak valid) secara spesifik jika perlu
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Format ID Produk tidak valid." });
        }
        res.status(500).json({ success: false, message: "Gagal mendapatkan detail produk karena kesalahan server." });
    }
};


export { addProduct, removeProduct, listProduct, updateProduct, singleProduct };