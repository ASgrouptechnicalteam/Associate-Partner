import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createTravelRequest, getTravelRequests, getTravelStats, updateTravelStatus } from '../controllers/travelController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

import { uploadFtp as upload } from '../utils/ftpStorage';

router.use(requireAuth);

router.get('/', getTravelRequests);
router.get('/stats', getTravelStats);
router.post('/', upload.single('supportingBill'), createTravelRequest);

// MD/AM Actions
router.post('/:id/status', requireRole(['AM', 'MD']), updateTravelStatus);

export default router;
