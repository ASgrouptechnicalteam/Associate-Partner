import { Router } from 'express';
import { getPendingRequests, approveRequest, rejectRequest, getApprovalHistory } from '../controllers/approvalController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole(['AM', 'MD']), getPendingRequests);
router.get('/history', requireRole(['AM', 'MD']), getApprovalHistory);
router.post('/:id/approve', requireRole(['AM', 'MD']), approveRequest);
router.post('/:id/reject', requireRole(['AM', 'MD']), rejectRequest);

export default router;
