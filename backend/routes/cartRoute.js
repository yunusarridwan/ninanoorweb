// routes/cartRoutes.js
import express from 'express';
import { addToCart, updateCart, removeFromCart, getUserCart, clearCart } from '../controllers/cartController.js';
import auth from '../middleware/auth.js'; // Sesuaikan path

const router = express.Router();

router.post('/add', auth, addToCart);
router.put('/update', auth, updateCart);
router.delete('/remove', auth, removeFromCart);
router.get('/', auth, getUserCart);
router.delete('/clear', auth, clearCart);

export default router;