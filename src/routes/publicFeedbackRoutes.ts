import { Router } from 'express';
import { submitFeedback } from '../controllers/publicFeedbackController';

const router = Router();

// Used for API submission
router.post('/:id', submitFeedback);

export default router;
