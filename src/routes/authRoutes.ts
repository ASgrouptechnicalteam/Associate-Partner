import { Router } from 'express';
import { login, logout, changePassword } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/change-password', requireAuth, changePassword);

export default router;
