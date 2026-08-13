import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalAssociates = await prisma.user.count({ where: { role: 'ASSOCIATE' } });
    const activeAssociates = await prisma.user.count({ where: { role: 'ASSOCIATE', isActive: true } });
    const pendingApprovals = await prisma.approvalRequest.count({ where: { status: 'PENDING_MD' } });
    const newReferrals = await prisma.approvalRequest.count({ where: { type: 'REFERRAL', status: 'PENDING_AM' } });

    // Mocking unimplemented modules based on Phase 4 spec
    const totalTeams = await prisma.user.count({ where: { role: 'ASSOCIATE', parentAssociateId: null } });
    const bookings = 15;
    const commissions = "₹1,24,500";
    const travelRequests = 3;
    const projectApprovals = 1;

    res.json({
      success: true,
      stats: {
        totalAssociates, activeAssociates, pendingApprovals, newReferrals,
        totalTeams, bookings, commissions, travelRequests, projectApprovals
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGlobalAssociates = async (req: AuthRequest, res: Response) => {
  try {
    const associates = await prisma.user.findMany({
      where: { role: 'ASSOCIATE' },
      include: {
        parentAssociate: { select: { name: true, userId: true } },
        profile: { select: { primaryPhone: true, email: true, joiningDate: true, commissionConfig: true } },
        _count: { select: { downline: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, associates });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
