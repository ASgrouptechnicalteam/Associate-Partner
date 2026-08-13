import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getMyProfile, updateMyProfile } from '../controllers/profileController';
import { requireAuth } from '../middleware/authMiddleware';

import { uploadFtp } from '../utils/ftpStorage';

const router = Router();
router.use(requireAuth);


router.get('/me', getMyProfile);
router.put('/me', uploadFtp.fields([{ name: 'aadhaarFile' }, { name: 'panFile' }, { name: 'profilePhoto' }]), updateMyProfile);

export default router;
