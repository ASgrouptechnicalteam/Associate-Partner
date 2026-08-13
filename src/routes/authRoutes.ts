import { Router } from 'express';
import { login, logout, changePassword, getMe } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/change-password', requireAuth, changePassword);
router.get('/me', requireAuth, getMe);

export default router;
