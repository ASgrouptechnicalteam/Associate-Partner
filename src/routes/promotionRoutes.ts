import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createPromotion, getPromotions, getActivePromotions, deletePromotion, togglePromotion, reorderPromotions, updatePromotion } from '../controllers/promotionController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

const uploadsDir = path.join(__dirname, '../../public/uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

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
