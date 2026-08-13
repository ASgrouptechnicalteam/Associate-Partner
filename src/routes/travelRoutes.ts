import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createTravelRequest, getTravelRequests, getTravelStats, updateTravelStatus } from '../controllers/travelController';
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

router.get('/', getTravelRequests);
router.get('/stats', getTravelStats);
router.post('/', upload.single('supportingBill'), createTravelRequest);

// MD/AM Actions
router.post('/:id/status', requireRole(['AM', 'MD']), updateTravelStatus);

export default router;
