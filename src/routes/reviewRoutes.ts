import { Router } from 'express';
import { requestReview, getReviews, getReviewStats } from '../controllers/reviewController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();
router.use(requireAuth);

router.get('/', getReviews);
router.post('/request', requestReview);
router.get('/stats', getReviewStats);

export default router;
