import { Router } from 'express';
import { runAgent } from '../controllers/agent.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Backward-compatible alias. The actual implementation is the shopping agent.
router.post('/chat', optionalAuth, runAgent);

export default router;
