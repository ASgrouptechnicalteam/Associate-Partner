import { Router } from 'express';
import { getFeedbackPage, submitFeedback } from '../controllers/publicFeedbackController';

const router = Router();

// Used for API submission
router.get('/:id', getFeedbackPage);
router.post('/:id', submitFeedback);

export default router;
