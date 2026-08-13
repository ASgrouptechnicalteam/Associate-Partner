import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getMyProfile, updateMyProfile } from '../controllers/profileController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

const uploadsDir = path.join(__dirname, '../../public/uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// Configure multer for local file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.use(requireAuth);

router.get('/me', getMyProfile);
router.put('/me', upload.fields([{ name: 'aadhaarFile' }, { name: 'panFile' }, { name: 'profilePhoto' }]), updateMyProfile);

export default router;
