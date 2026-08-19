import { Router } from 'express';
import { mintLiveSessionToken } from '../controllers/live.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/token', requireAuth, mintLiveSessionToken);

export default router;