import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes';
import { requireAuth, checkFirstLogin, requireRole } from './middleware/authMiddleware';

dotenv.config();

// ── Production guard: crash fast if required secrets are missing ──────────────
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Server will not start.');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// ── Trust Hostinger reverse proxy so req.secure works properly ────────────────
app.set('trust proxy', 1);

// ── Security headers via Helmet ───────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // allow EJS to load external resources
  })
);

// ── CORS: restrict to your production domain or allow all in dev ──────────────
const allowedOrigin = process.env.ALLOWED_ORIGIN;
app.use(
  cors({
    origin: isProduction
      ? (origin, callback) => {
          // Allow same-origin requests (no origin header) and the configured domain
          if (!origin || origin === allowedOrigin) {
            callback(null, true);
          } else {
            callback(new Error(`CORS: origin '${origin}' not allowed`));
          }
        }
      : true, // allow all origins in development
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));


// ── Health Endpoint ─────────────────────────────────────────────────────────────
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

// ── Protected Auth Wrapper ────────────────────────────────────────────────────
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
import documentRoutes from './routes/documentRoutes';
import { getFeedbackPage } from './controllers/publicFeedbackController';
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
app.use('/api/public/feedback', publicFeedbackRoutes); // No auth required for public form
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes); // Private document streaming
app.use('/api/profile', profileRoutes);

// Provide frontend
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// All frontend routes are now handled by the React SPA


// ── Global error handler — no stack traces in production ──────────────────────
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const status = err.status || 500;
  if (isProduction) {
    res.status(status).json({ error: 'An unexpected error occurred.' });
  } else {
    res.status(status).json({ error: err.message, stack: err.stack });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port} [${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
});
