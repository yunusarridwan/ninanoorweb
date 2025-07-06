import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";

// Status pembayaran yang dianggap "Paid" di database Anda
const PAID_STATUS = "Pembayaran Dikonfirmasi"; // SESUAIKAN DENGAN NILAI STATUS DI DATABASE ANDA

// Mengambil data dashboard utama (Total Products, Total Customers, Total Sales Count)
const getDashboardSummary = async (req, res) => {
    try {
        // Total Produk
        const totalProducts = await productModel.countDocuments();

        // Total Pelanggan (misal: pengguna dengan role 'user')
        // Asumsi: Semua entri di koleksi User adalah pelanggan, atau Anda memiliki field 'role'
        const totalCustomers = await userModel.countDocuments(); // Sesuaikan jika role tidak ada atau berbeda

        // Total Penjualan (Total Order Count) - semua order, terlepas dari status
        const totalSalesCount = await orderModel.countDocuments();

        res.status(200).json({
            totalProducts,
            totalCustomers,
            totalSalesCount,
            message: "Dashboard summary fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching dashboard summary:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Mengambil Penjualan Terbaru (Recent Sales)
const getRecentSales = async (req, res) => {
    try {
        // Ambil 7 order terbaru, diurutkan dari yang terbaru (orderDate atau createdAt), hanya yang PAID_STATUS
        const recentSales = await orderModel
            .find({ status: PAID_STATUS }) // Filter berdasarkan status pembayaran
            .sort({ orderDate: -1 }) // Urutkan dari yang terbaru. Gunakan 'createdAt' jika 'orderDate' tidak ada.
            .limit(7) // Ambil 7 dokumen pertama
            .populate({ // Lakukan populate untuk mendapatkan data user (username, email)
                path: 'userId',
                select: 'username email' // Pilih field 'username' dan 'email' dari model User
            })
            .select('totalAmount orderDate'); // Pilih field yang dibutuhkan dari Order

        // Format data agar sesuai dengan ekspektasi frontend
        const formattedRecentSales = recentSales.map((order) => ({
            id: order._id,
            // Pastikan order.userId ada sebelum mengakses propertinya. Gunakan 'username'
            name: order.userId ? order.userId.username : 'Unknown User',
            email: order.userId ? order.userId.email : 'unknown@example.com',
            image: 'https://placehold.co/40x40/E0E7FF/4338CA?text=User', // Placeholder, ganti dengan gambar profil jika ada di model User
            total: order.totalAmount,
            orderDate: order.orderDate,
        }));

        res.status(200).json({
            recentSales: formattedRecentSales, // Kirim data penjualan terbaru
            message: "Recent sales fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching recent sales:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// FUNGSI BARU: Mengambil Jumlah Pesanan per Status
const getOrderStatusCounts = async (req, res) => {
    try {
        const statusCounts = await orderModel.aggregate([
            {
                $group: {
                    _id: "$status", // Group berdasarkan field 'status'
                    count: { $sum: 1 } // Hitung jumlah dokumen di setiap grup
                }
            },
            {
                $project: {
                    _id: 0, // Jangan sertakan _id dari grouping
                    status: "$_id", // Ubah _id menjadi field 'status'
                    count: 1
                }
            }
        ]);

        // Format hasil menjadi objek yang mudah diakses di frontend
        const formattedStatusCounts = {};
        statusCounts.forEach(item => {
            formattedStatusCounts[item.status] = item.count;
        });

        res.status(200).json({
            statusCounts: formattedStatusCounts,
            message: "Order status counts fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching order status counts:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getTotalCategories = async (req, res) => {
    try {
        const totalCategories = await categoryModel.countDocuments();
        res.status(200).json({
            totalCategories,
            message: "Total categories fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching total categories:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


export default {
    getDashboardSummary,
    getRecentSales,
    getOrderStatusCounts, 
    getTotalCategories,
};