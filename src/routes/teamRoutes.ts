import { Router } from 'express';
import { getTeamTree, getTeamStats } from '../controllers/teamController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();
router.use(requireAuth);

router.get('/tree', getTeamTree);
router.get('/stats', getTeamStats);

export default router;
