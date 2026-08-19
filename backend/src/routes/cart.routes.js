import { Router } from 'express';
import { addToCart, clearCart, getCart, removeFromCart, updateCartItem } from '../controllers/cart.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', getCart);
router.delete('/', clearCart);
router.post('/items', addToCart);
router.patch('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeFromCart);

export default router;
