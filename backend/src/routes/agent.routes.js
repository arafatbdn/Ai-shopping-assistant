import { Router } from 'express';
import { runAgent } from '../controllers/agent.controller.js';
import { executeAgentTools } from '../controllers/agent-execute.controller.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/chat', optionalAuth, runAgent);
router.post('/execute', optionalAuth, executeAgentTools);

export default router;
