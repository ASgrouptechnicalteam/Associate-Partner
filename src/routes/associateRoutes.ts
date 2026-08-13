import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createAssociate, referAssociate, getTeam } from '../controllers/associateController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

import { uploadFtp as upload } from '../utils/ftpStorage';

router.use(requireAuth);

// AM or MD creates an associate
router.post('/', requireRole(['AM', 'MD']), upload.fields([{ name: 'aadhaarFile' }, { name: 'panFile' }, { name: 'profilePhoto' }]), createAssociate);

// Associate refers someone
router.post('/referral', requireRole(['ASSOCIATE']), referAssociate);

// Get hierarchical team
router.get('/team', getTeam);

export default router;
