import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createPromotion, getPromotions, getActivePromotions, deletePromotion, togglePromotion, reorderPromotions, updatePromotion } from '../controllers/promotionController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

import { uploadFtp as upload } from '../utils/ftpStorage';

router.use(requireAuth);

router.get('/active', getActivePromotions); // All roles

// Admin only
router.get('/', requireRole(['AM', 'MD']), getPromotions);
router.post('/', requireRole(['AM', 'MD']), upload.single('image'), createPromotion);
router.put('/:id', requireRole(['AM', 'MD']), upload.single('image'), updatePromotion);
router.delete('/:id', requireRole(['AM', 'MD']), deletePromotion);
router.post('/:id/toggle', requireRole(['AM', 'MD']), togglePromotion);
router.post('/reorder', requireRole(['AM', 'MD']), reorderPromotions);

export default router;
