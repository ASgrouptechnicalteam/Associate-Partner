import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes';
import { requireAuth, checkFirstLogin, requireRole } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Public Routes
app.get('/login', (req, res) => res.render('pages/login'));
app.use('/api/auth', authRoutes);

// Protected Auth Wrapper
app.use(requireAuth);
app.use(checkFirstLogin);

import associateRoutes from './routes/associateRoutes';
import approvalRoutes from './routes/approvalRoutes';
import adminRoutes from './routes/adminRoutes';
import projectRoutes from './routes/projectRoutes';
import promotionRoutes from './routes/promotionRoutes';
import bookingRoutes from './routes/bookingRoutes';
import commissionRoutes from './routes/commissionRoutes';
import teamRoutes from './routes/teamRoutes';
import travelRoutes from './routes/travelRoutes';
import siteVisitRoutes from './routes/siteVisitRoutes';
import reviewRoutes from './routes/reviewRoutes';
import publicFeedbackRoutes from './routes/publicFeedbackRoutes';
import notificationRoutes from './routes/notificationRoutes';
import profileRoutes from './routes/profileRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { getFeedbackPage } from './controllers/publicFeedbackController';
import { getEditProfilePage } from './controllers/profileController';
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/associates', associateRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/travel', travelRoutes);
app.use('/api/site-visits', siteVisitRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/public/feedback', publicFeedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);

// Public EJS Route
app.get('/feedback/:id', getFeedbackPage);

app.get('/change-password', (req, res) => res.render('pages/change-password'));
app.get('/associates/new', requireRole(['AM', 'MD']), (req: any, res) => res.render('pages/associate-form', { title: 'Add Associate', activePath: '/team', user: req.user }));
app.get('/admin/associates', requireRole(['MD', 'AM']), (req: any, res) => res.render('pages/associate-management', { title: 'Manage Associates', activePath: '/admin/associates', user: req.user }));
app.get('/approval-center', requireRole(['MD', 'AM']), (req: any, res) => res.render('pages/approval-center', { title: 'Approval Center', activePath: '/approval-center', user: req.user }));
app.get('/approvals', (req, res) => res.redirect('/approval-center'));

app.get('/projects/new', requireRole(['AM', 'MD']), (req: any, res) => res.render('pages/project-form', { title: 'Create Project', activePath: '/projects', user: req.user }));
app.get('/projects/:id/edit', requireRole(['AM', 'MD']), (req: any, res) => res.render('pages/project-form', { title: 'Edit Project', activePath: '/projects', user: req.user }));
app.get('/projects/:id', (req: any, res) => res.render('pages/project-details', { title: 'Project Details', activePath: '/projects', user: req.user, projectId: req.params.id }));

app.get('/carousel-manager', requireRole(['AM', 'MD']), (req: any, res) => res.render('pages/carousel-manager', { title: 'Promotions Manager', activePath: '/carousel-manager', user: req.user }));
app.get('/popup-manager', requireRole(['AM', 'MD']), (req: any, res) => res.render('pages/popup-manager', { title: 'Popup Manager', activePath: '/popup-manager', user: req.user }));
app.get('/dashboard-content', requireRole(['AM', 'MD']), (req: any, res) => res.render('pages/dashboard-content', { title: 'Dashboard Content', activePath: '/dashboard-content', user: req.user }));
app.get('/offers', (req: any, res) => res.render('pages/offers', { title: 'Offers & Promotions', activePath: '/offers', user: req.user }));

app.get('/bookings', (req: any, res) => res.render('pages/bookings', { title: 'Booking Management', activePath: '/bookings', user: req.user }));
app.get('/bookings/new', (req: any, res) => res.render('pages/booking-form', { title: 'New Booking', activePath: '/bookings', user: req.user }));

app.get('/commissions', (req: any, res) => res.render('pages/commissions', { title: 'Commission Management', activePath: '/commissions', user: req.user }));
app.get('/team', (req: any, res) => res.render('pages/team', { title: 'My Team', activePath: '/team', user: req.user }));
app.get('/travel', (req: any, res) => res.render('pages/travel', { title: 'Travel Allowance', activePath: '/travel', user: req.user }));
app.get('/site-visits', (req: any, res) => res.render('pages/site-visits', { title: 'Site Visits', activePath: '/site-visits', user: req.user }));
app.get('/reviews', (req: any, res) => res.render('pages/reviews', { title: 'Customer Reviews', activePath: '/reviews', user: req.user }));
app.get('/notifications', (req: any, res) => res.render('pages/notifications', { title: 'Notifications', activePath: '/notifications', user: req.user }));
app.get('/profile', (req: any, res) => res.render('pages/profile', { title: 'My Profile', activePath: '/profile', user: req.user }));
app.get('/profile/edit', requireAuth, getEditProfilePage);
app.get('/help', (req: any, res) => res.render('pages/help', { title: 'Help Center', activePath: '/help', user: req.user }));

const routes = [
  { path: '/', view: 'pages/dashboard', title: 'Dashboard' },
  { path: '/projects', view: 'pages/projects', title: 'Projects' },
  { path: '/bookings', view: 'pages/bookings', title: 'Bookings' },
  { path: '/commissions', view: 'pages/commissions', title: 'Commissions' },
  { path: '/team', view: 'pages/team', title: 'Team' },
  { path: '/offers', view: 'pages/offers', title: 'Offers' },
  { path: '/pending-requests', view: 'pages/pending-requests', title: 'Pending Requests' },
  { path: '/travel', view: 'pages/travel', title: 'Travel Allowance' },
  { path: '/site-visits', view: 'pages/site-visits', title: 'Site Visits' },
  { path: '/notifications', view: 'pages/notifications', title: 'Notifications' },
  { path: '/reviews', view: 'pages/reviews', title: 'Reviews' },
  { path: '/profile', view: 'pages/profile', title: 'My Profile' },
  { path: '/faq', view: 'pages/faq', title: 'FAQ' },
  { path: '/tutorials', view: 'pages/tutorials', title: 'Tutorials' }
];

routes.forEach(route => {
  app.get(route.path, (req: Request, res: Response) => {
    // Pass req.user to EJS templates
    res.render(route.view, { title: route.title, activePath: route.path, user: (req as any).user });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
