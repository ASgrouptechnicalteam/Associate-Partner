import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { downloadPrivateDocument } from '../controllers/documentController';

const router = Router();

// All documents are protected and require authentication
router.use(requireAuth);

router.get('/:filename', downloadPrivateDocument);

export default router;
