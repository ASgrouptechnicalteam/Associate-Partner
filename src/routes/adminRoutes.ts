import { Router } from 'express';
import { getDashboardStats, getGlobalAssociates } from '../controllers/adminController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);
router.use(requireRole(['MD', 'AM']));

router.get('/stats', getDashboardStats);
router.get('/associates', getGlobalAssociates);

export default router;
