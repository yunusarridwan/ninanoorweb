// routes/api/authRoutes.js
import express from 'express';
import { adminLogin } from '../../controllers/authController.js';

const router = express.Router();

// Endpoint untuk login admin (baik superadmin hardcoded maupun admin dari DB)
router.post('/admin/login', adminLogin);

export default router;
