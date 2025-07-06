// routes/orderRoute.js
import express from "express";
import {
    allOrders,
    placeOrder,
    updateStatus,
    userOrders,
    getOrderStatusCountByUser,
    getOrderDetail,
    updateOrderStatus, // <--- Pastikan ini tetap diimpor untuk digunakan frontend
    getOrderDetailSimple
} from '../controllers/orderController.js';

import {
    getMidtransToken,
    handleMidtransNotification,
    sendInvoiceEmail,
    getInvoiceById,
    getInvoiceByOrderDetailId,
    checkMidtransTransactionStatus,
    getAllInvoices,
    getRevenueReport
} from '../controllers/invoiceController.js';

import {
    getOrderDetailByOrderId,
    updateOrderDetail,
    deleteOrderDetail
} from '../controllers/orderDetailController.js';

import requireAdmin from '../middleware/requireAdmin.js';
import auth from '../middleware/auth.js';

const orderRouter = express.Router();

orderRouter.post('/place', auth, placeOrder);
orderRouter.get('/all', auth, requireAdmin, allOrders);
orderRouter.patch('/:orderId/status', auth, requireAdmin, updateStatus);
orderRouter.get("/status-count/:userId", auth, requireAdmin, getOrderStatusCountByUser);
orderRouter.get('/me', auth, userOrders);
orderRouter.get("/:orderId", auth, getOrderDetail);
orderRouter.get("/:orderId/no-invoice-details", auth, getOrderDetailSimple);

// --- Rute Pembayaran & Invoice (via invoiceController) ---
orderRouter.post("/midtrans/token", auth, getMidtransToken); // URL untuk frontend
orderRouter.put("/update-status/:orderId", auth, updateOrderStatus); // <--- Rute ini digunakan oleh frontend
orderRouter.post("/midtrans-notification", handleMidtransNotification); // Tetap ada, tapi tidak melakukan update DB
orderRouter.post("/send-invoice-email/:orderId", auth, sendInvoiceEmail);
orderRouter.get("/invoice/:invoiceId", auth, getInvoiceById);

orderRouter.get("/invoices/all", auth, requireAdmin, getAllInvoices); // Untuk tabel invoices

orderRouter.get("/:orderId/details", auth, getOrderDetailByOrderId);
orderRouter.put("/details/:orderDetailId", auth, requireAdmin, updateOrderDetail);
orderRouter.delete("/details/:orderDetailId", auth, requireAdmin, deleteOrderDetail);
orderRouter.get("/invoice/by-order-detail/:orderDetailId", auth, getInvoiceByOrderDetailId);
orderRouter.post("/midtrans/check-status", auth, checkMidtransTransactionStatus); // <-- Rute baru


export default orderRouter;