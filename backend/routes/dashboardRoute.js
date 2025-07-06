import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import auth from '../middleware/auth.js'; // Middleware autentikasi generik
import requireAdmin from '../middleware/requireAdmin.js';

const dashboardRouter = express.Router();

// Route untuk ringkasan dashboard (Total Products, Total Customers, Total Sales Count)
dashboardRouter.get('/summary', auth, requireAdmin, dashboardController.getDashboardSummary);

// Route untuk penjualan terbaru
dashboardRouter.get('/order/recent-sales', auth, requireAdmin, dashboardController.getRecentSales);

// Route BARU untuk jumlah pesanan per status
dashboardRouter.get('/order-status-counts', auth, requireAdmin, dashboardController.getOrderStatusCounts); 

dashboardRouter.get('/total-categories', auth, requireAdmin, dashboardController.getTotalCategories);

export default dashboardRouter;