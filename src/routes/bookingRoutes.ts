import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createBooking, getBookings, verifyBooking, rejectBooking } from '../controllers/bookingController';
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

router.get('/', getBookings);
router.post('/', upload.fields([{ name: 'documents', maxCount: 5 }]), createBooking);

router.post('/:id/verify', requireRole(['AM', 'MD']), verifyBooking);
router.post('/:id/reject', requireRole(['AM', 'MD']), rejectBooking);

export default router;
