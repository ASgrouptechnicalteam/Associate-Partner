import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) return res.redirect('/login');

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Check if session still exists in DB
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) {
      res.clearCookie('token');
      return res.redirect('/login?error=session_expired');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) {
      res.clearCookie('token');
      return res.redirect('/login?error=account_inactive');
    }

    req.user = user;
    next();
  } catch (err) {
    res.clearCookie('token');
    return res.redirect('/login?error=invalid_token');
  }
};

export const checkFirstLogin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.isFirstLogin && req.path !== '/change-password' && !req.path.startsWith('/api/auth')) {
    return res.redirect('/change-password');
  }
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).send('Forbidden: You do not have access to this resource.');
    }
    next();
  };
};
