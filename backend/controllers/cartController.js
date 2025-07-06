import userModel from "../models/userModel.js"; // Pastikan userModel diimpor

// Helper function untuk memperbarui keranjang di database
// Sekarang, 'items' yang diterima di sini adalah objek bersarang (items)
const updateUserCartInDB = async (userId, items) => {
    // Karena items di userModel adalah Mixed, kita langsung menyimpannya
    await userModel.findByIdAndUpdate(userId, { items });
};

// --- Menambahkan Produk ke Keranjang ---
const addToCart = async (req, res) => {
    try {
        const userId = req.user.id; // Dari middleware auth
        // Frontend mengirim productId, size, dan quantity BARU (total quantity setelah ditambahkan 1 di frontend)
        const { productId, size, quantity } = req.body;

        // Validasi input
        if (!productId || !size || quantity === undefined || quantity < 1) {
            return res.status(400).json({ success: false, message: "Product ID, size, and a valid quantity (>=1) are required." });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // >>> PERUBAHAN KRUSIAL: Ambil keranjang sebagai objek (default {}) <<<
        let currentitems = userData.items || {}; // userModel.items adalah object

        // Pastikan ada properti untuk productId jika belum ada
        if (!currentitems[productId]) {
            currentitems[productId] = {};
        }

        // Langsung set quantity untuk size spesifik
        // Karena frontend mengirim quantity final (total quantity setelah penambahan),
        // backend hanya perlu menyimpannya.
        currentitems[productId][size] = quantity;

        // Gunakan helper function yang sudah disesuaikan
        await updateUserCartInDB(userId, currentitems);

        res.status(200).json({ success: true, message: "Product added/updated in cart successfully." });

    } catch (error) {
        console.error("Error adding to cart (backend):", error);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

// --- Memperbarui Kuantitas Item di Keranjang ---
const updateCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, size, quantity } = req.body;

        if (!productId || size === undefined || quantity === undefined || quantity < 0) {
            return res.status(400).json({ success: false, message: "Product ID, size, and a valid quantity (>=0) are required." });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // >>> PERUBAHAN KRUSIAL: Ambil keranjang sebagai objek <<<
        let currentitems = userData.items || {};

        // Periksa apakah produk dengan ukuran ini ada di keranjang
        if (!currentitems[productId] || currentitems[productId][size] === undefined) {
             // Jika kuantitas yang diminta adalah 0, dan item tidak ada, anggap sukses penghapusan
             // Atau bisa juga kembalikan 404 jika ingin lebih strict
             if (quantity === 0) {
                 return res.status(200).json({ success: true, message: "Item not found in cart, already removed." });
             }
             return res.status(404).json({ success: false, message: "Product not found in cart with specified size." });
        }

        if (quantity > 0) {
            currentitems[productId][size] = quantity; // Perbarui kuantitas
        } else {
            // Hapus item/size jika kuantitas 0 atau kurang
            delete currentitems[productId][size];
            // Jika tidak ada size lain untuk productId ini, hapus juga productId dari keranjang
            if (Object.keys(currentitems[productId]).length === 0) {
                delete currentitems[productId];
            }
        }

        // Gunakan helper function yang sudah disesuaikan
        await updateUserCartInDB(userId, currentitems);

        res.status(200).json({ success: true, message: "Cart updated successfully." });

    } catch (error) {
        console.error("Error updating cart (backend):", error);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

// --- Menghapus Item dari Keranjang ---
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, size } = req.body; // productId dan size yang akan dihapus

        if (!productId || size === undefined) {
            return res.status(400).json({ success: false, message: "Product ID and size are required for removal." });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // >>> PERUBAHAN KRUSIAL: Ambil keranjang sebagai objek <<<
        let currentitems = userData.items || {};

        // Periksa apakah produk dengan ukuran ini ada di keranjang sebelum menghapus
        if (currentitems[productId] && currentitems[productId][size] !== undefined) {
            // Hapus item/size
            delete currentitems[productId][size];
            // Jika tidak ada size lain untuk productId ini, hapus juga productId dari keranjang
            if (Object.keys(currentitems[productId]).length === 0) {
                delete currentitems[productId];
            }
        } else {
            // Jika item tidak ditemukan di keranjang, bisa dianggap sudah dihapus
            return res.status(200).json({ success: true, message: "Product already removed from cart or not found." });
        }

        // Gunakan helper function yang sudah disesuaikan
        await updateUserCartInDB(userId, currentitems);

        res.status(200).json({ success: true, message: "Product removed from cart successfully." });

    } catch (error) {
        console.error("Error removing from cart (backend):", error);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

// --- Mendapatkan Data Keranjang Pengguna ---
const getUserCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        // Kirim items langsung, karena formatnya sudah objek
        // Kita namakan 'items' di respons JSON agar frontend (ShopContext) bisa menerimanya langsung
        res.status(200).json({ success: true, items: userData.items || {} });
    } catch (error) {
        console.error("Error fetching user cart (backend):", error);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

// --- Membersihkan Seluruh Keranjang Pengguna ---
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        // Kosongkan keranjang menjadi objek kosong
        await updateUserCartInDB(userId, {}); // Set items ke objek kosong
        res.status(200).json({ success: true, message: "Cart cleared successfully." });

    } catch (error) {
        console.error("Error clearing cart (backend):", error);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

export { addToCart, updateCart, removeFromCart, getUserCart, clearCart };