import { Router } from 'express';
import { cancelLatestOrder, getLatestOrder, listOrders } from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', listOrders);
router.get('/latest', getLatestOrder);
router.post('/latest/cancel', cancelLatestOrder);

export default router;
