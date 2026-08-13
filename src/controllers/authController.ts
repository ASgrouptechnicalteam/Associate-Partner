import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// JWT_SECRET is guaranteed by the startup guard in app.ts
const JWT_SECRET = process.env.JWT_SECRET as string;

export const login = async (req: Request, res: Response) => {
  const { userId, password } = req.body;
  if (!userId || !password) return res.status(400).json({ error: 'User ID and Password required.' });

  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
  if (!user.isActive) return res.status(401).json({ error: 'Account is inactive.' });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });

  // Single Device Policy for MD and AM: Evict existing sessions
  if (user.role === 'MD' || user.role === 'AM') {
    await prisma.session.deleteMany({ where: { userId: user.id } });
  }

  // Generate Token and Session
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      deviceInfo: req.headers['user-agent'] || 'Unknown Device',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
    }
  });

  await prisma.auditLog.create({
    data: {
      action: 'LOGIN',
      userId: user.id,
      details: JSON.stringify({ role: user.role, deviceInfo: req.headers['user-agent'] })
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    secure: isProduction,       // HTTPS-only in production
    sameSite: 'strict',
  });
  res.json({ success: true, isFirstLogin: user.isFirstLogin });
};

export const logout = async (req: AuthRequest, res: Response) => {
  const token = req.cookies?.token;
  if (token) {
    const session = await prisma.session.findUnique({ where: { token } });
    if (session) {
      await prisma.auditLog.create({
        data: {
          action: 'LOGOUT',
          userId: session.userId,
          details: JSON.stringify({ deviceInfo: req.headers['user-agent'] })
        }
      });
      await prisma.session.delete({ where: { token } });
    }
  }
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Not authenticated.' });

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) return res.status(400).json({ error: 'Incorrect current password.' });

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash, isFirstLogin: false }
  });

  await prisma.auditLog.create({
    data: {
      action: 'PASSWORD_CHANGE',
      userId: user.id,
      details: JSON.stringify({ role: user.role, deviceInfo: req.headers['user-agent'] })
    }
  });

  res.json({ success: true });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
  // Don't return passwordHash
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...safeUser } = req.user;
  res.json({ success: true, user: safeUser });
};
