import { Router } from 'express';
import { compareProducts, getUserInsights, summarizeReviews } from '../controllers/intelligence.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/compare', compareProducts);
router.post('/reviews/summary', summarizeReviews);
router.get('/insights', requireAuth, getUserInsights);

export default router;
