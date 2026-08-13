import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createProject, getProjects, getProjectDetails, addInventoryUnit, updateInventoryUnit, deleteInventoryUnit, assignProject, saveProjectDraft, submitProjectForApproval } from '../controllers/projectController';
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

router.get('/', getProjects);
router.get('/:id', getProjectDetails);

// AM/MD actions
router.post('/', requireRole(['AM', 'MD']), upload.fields([
  { name: 'brochure', maxCount: 1 },
  { name: 'layout', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]), createProject);

// Wizard: save draft (create or update)
router.post('/draft', requireRole(['AM', 'MD']), saveProjectDraft);
router.put('/draft', requireRole(['AM', 'MD']), saveProjectDraft);

// Submit for approval
router.post('/:id/submit', requireRole(['AM', 'MD']), submitProjectForApproval);

// Inventory management
router.post('/:id/units', requireRole(['AM', 'MD']), addInventoryUnit);
router.put('/:id/units/:unitId', requireRole(['AM', 'MD']), updateInventoryUnit);
router.delete('/:id/units/:unitId', requireRole(['AM', 'MD']), deleteInventoryUnit);

router.post('/:id/assign', requireRole(['AM', 'MD']), assignProject);

export default router;
