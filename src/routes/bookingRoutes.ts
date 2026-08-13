import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createBooking, getBookings, verifyBooking, rejectBooking } from '../controllers/bookingController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

import { uploadFtp as upload } from '../utils/ftpStorage';

router.use(requireAuth);

router.get('/', getBookings);
router.post('/', upload.fields([{ name: 'documents', maxCount: 5 }]), createBooking);

router.post('/:id/verify', requireRole(['AM', 'MD']), verifyBooking);
router.post('/:id/reject', requireRole(['AM', 'MD']), rejectBooking);

export default router;
