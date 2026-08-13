import { Router } from 'express';
import { createSiteVisit, getSiteVisits, updateSiteVisitStatus, submitPostVisit } from '../controllers/siteVisitController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();
router.use(requireAuth);

router.get('/', getSiteVisits);
router.post('/', createSiteVisit);
router.put('/:id/status', updateSiteVisitStatus);
router.put('/:id/post-visit', submitPostVisit);

export default router;
