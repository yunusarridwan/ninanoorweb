// controllers/orderDetailController.js
import orderDetailModel from "../models/orderDetailModel.js";
import mongoose from "mongoose"; // <--- TAMBAHKAN BARIS INI

// --- Order Detail Controller Functions ---

/**
 * @desc Get order details by Order ID
 * @route GET /api/orderdetails/:orderId
 * @access Public (atau Private, tergantung kebutuhan frontend)
 */
const getOrderDetailByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) { // Baris ini yang butuh 'mongoose'
            return res.status(400).json({ success: false, message: "ID Pesanan tidak valid!" });
        }

        // Cari OrderDetail berdasarkan orderId
        // Populasikan item.productId untuk mendapatkan detail produk jika diperlukan
        const orderDetail = await orderDetailModel.findOne({ orderId })
                                            .populate('items.productId');

        if (!orderDetail) {
            return res.status(404).json({ success: false, message: "Detail pesanan tidak ditemukan untuk ID Order ini." });
        }

        res.status(200).json({ success: true, orderDetail });
    } catch (error) {
        console.error("Error fetching order detail by orderId:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Update order detail (misalnya, alamat atau catatan pengiriman)
 * @route PUT /api/orderdetails/:orderDetailId
 * @access Private (Admin atau User pemilik order)
 * @body {Object} updates - Objek berisi field yang ingin diupdate
 *
 * Catatan: Mengupdate item di sini bisa kompleks. Biasanya item tidak diupdate setelah order dibuat.
 * Jika item berubah, lebih baik buat order baru atau batalkan order lama.
 * Oleh karena itu, saya tidak akan menyertakan update `items` di sini.
 */
const updateOrderDetail = async (req, res) => {
    try {
        const { orderDetailId } = req.params;
        const updates = req.body; // Misalnya: { "address.street": "Jalan Baru", "messageOrder": "Catatan baru" }

        if (!mongoose.Types.ObjectId.isValid(orderDetailId)) { // Baris ini juga butuh 'mongoose'
            return res.status(400).json({ success: false, message: "ID Detail Pesanan tidak valid!" });
        }

        // Filter field yang boleh diupdate untuk menghindari update yang tidak diinginkan
        const allowedUpdates = [
            'address.street', 'address.city', 'address.province', 'address.zipcode',
            'recipientName', 'recipientPhone', 'messageOrder'
            // 'shippingCost' mungkin hanya diupdate oleh admin
            // 'amount' tidak boleh diupdate manual karena ini subtotal item
        ];

        const updateData = {};
        for (const key of Object.keys(updates)) {
            if (allowedUpdates.includes(key)) {
                updateData[key] = updates[key];
            } else if (key.startsWith('address.') && allowedUpdates.includes(key)) {
                // Untuk nested fields seperti address.street
                const addressField = key.split('.')[1];
                if (!updateData.address) updateData.address = {};
                updateData.address[addressField] = updates[key];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: "Tidak ada field yang valid untuk diupdate." });
        }

        const updatedOrderDetail = await orderDetailModel.findByIdAndUpdate(
            orderDetailId,
            { $set: updateData }, // Menggunakan $set untuk update field tertentu
            { new: true, runValidators: true } // Mengembalikan dokumen yang diupdate dan menjalankan validator
        );

        if (!updatedOrderDetail) {
            return res.status(404).json({ success: false, message: "Detail pesanan tidak ditemukan." });
        }

        res.status(200).json({ success: true, message: "Detail pesanan berhasil diperbarui.", orderDetail: updatedOrderDetail });
    } catch (error) {
        console.error("Error updating order detail:", error);
        // Tangani error validasi Mongoose secara spesifik jika diperlukan
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message, errors: error.errors });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Delete order detail (hanya jika order utama juga dihapus)
 * @route DELETE /api/orderdetails/:orderDetailId
 * @access Private (Admin only)
 *
 * Catatan: Ini harusnya dihandle sebagai bagian dari penghapusan Order,
 * bukan sebagai operasi mandiri yang umum diakses dari luar.
 * Hanya untuk kelengkapan jika memang ada kebutuhan.
 */
const deleteOrderDetail = async (req, res) => {
    try {
        const { orderDetailId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderDetailId)) { // Baris ini juga butuh 'mongoose'
            return res.status(400).json({ success: false, message: "ID Detail Pesanan tidak valid!" });
        }

        const deletedOrderDetail = await orderDetailModel.findByIdAndDelete(orderDetailId);

        if (!deletedOrderDetail) {
            return res.status(404).json({ success: false, message: "Detail pesanan tidak ditemukan." });
        }

        res.status(200).json({ success: true, message: "Detail pesanan berhasil dihapus." });
    } catch (error) {
        console.error("Error deleting order detail:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    getOrderDetailByOrderId,
    updateOrderDetail,
    deleteOrderDetail
};