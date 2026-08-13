import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createAssociate, referAssociate, getTeam } from '../controllers/associateController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

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

// AM or MD creates an associate
router.post('/', requireRole(['AM', 'MD']), upload.fields([{ name: 'aadhaarFile' }, { name: 'panFile' }, { name: 'profilePhoto' }]), createAssociate);

// Associate refers someone
router.post('/referral', requireRole(['ASSOCIATE']), referAssociate);

// Get hierarchical team
router.get('/team', getTeam);

export default router;
