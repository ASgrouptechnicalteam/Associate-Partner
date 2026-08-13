import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDashboardData } from '../controllers/dashboardController';
import {
  getCarousels, getPublishedCarousels, createCarousel, updateCarousel, deleteCarousel, reorderCarousels,
  getOffers, createOffer, updateOffer, deleteOffer,
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  dismissAnnouncement,
  getPopups, getPublishedPopup, createPopup, updatePopup, deletePopup
} from '../controllers/dashboardContentController';
import { requireRole } from '../middleware/authMiddleware';

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../public/uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });


// General Dashboard Data (Any authenticated user)
router.get('/data', getDashboardData);
router.post('/announcements/:id/dismiss', dismissAnnouncement);
router.get('/carousel/published', getPublishedCarousels);
router.get('/popup/published', getPublishedPopup);

// MD & AM Content Management APIs
router.get('/carousel', requireRole(['MD', 'AM']), getCarousels);
router.post('/carousel', requireRole(['MD', 'AM']), upload.single('image'), createCarousel);
router.put('/carousel/reorder', requireRole(['MD', 'AM']), reorderCarousels);
router.put('/carousel/:id', requireRole(['MD', 'AM']), upload.single('image'), updateCarousel);
router.delete('/carousel/:id', requireRole(['MD', 'AM']), deleteCarousel);

// Popup Management APIs
router.get('/popup', requireRole(['MD', 'AM']), getPopups);
router.post('/popup', requireRole(['MD', 'AM']), upload.single('image'), createPopup);
router.put('/popup/:id', requireRole(['MD', 'AM']), upload.single('image'), updatePopup);
router.delete('/popup/:id', requireRole(['MD', 'AM']), deletePopup);


router.get('/offers', requireRole(['MD', 'AM']), getOffers);
router.post('/offers', requireRole(['MD', 'AM']), createOffer);
router.put('/offers/:id', requireRole(['MD', 'AM']), updateOffer);
router.delete('/offers/:id', requireRole(['MD', 'AM']), deleteOffer);

router.get('/announcements', requireRole(['MD', 'AM']), getAnnouncements);
router.post('/announcements', requireRole(['MD', 'AM']), createAnnouncement);
router.put('/announcements/:id', requireRole(['MD', 'AM']), updateAnnouncement);
router.delete('/announcements/:id', requireRole(['MD', 'AM']), deleteAnnouncement);

export default router;
