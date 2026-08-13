import { Router } from 'express';
import { getCommissions, getCommissionStats, recordCommission, updateCommissionStatus, requestConfigChange } from '../controllers/commissionController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();
router.use(requireAuth);

router.get('/', getCommissions);
router.get('/stats', getCommissionStats);

// AM/MD Actions
router.post('/', requireRole(['AM', 'MD']), recordCommission);
router.post('/:id/status', requireRole(['AM', 'MD']), updateCommissionStatus);
router.post('/associate/:associateId/request-change', requireRole(['AM', 'MD']), requestConfigChange);

export default router;
