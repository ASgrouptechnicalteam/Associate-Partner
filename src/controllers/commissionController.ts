import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Helper to get recursive downline IDs (same logic as bookings)
async function getDownlineIds(parentId: string): Promise<string[]> {
  const children = await prisma.user.findMany({ where: { parentAssociateId: parentId }, select: { id: true } });
  let ids: string[] = [];
  for (const child of children) {
    ids.push(child.id);
    ids = ids.concat(await getDownlineIds(child.id));
  }
  return ids;
}

export const getCommissions = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, projectId } = req.query;
    let whereClause: any = {};

    if (projectId) whereClause.projectId = projectId;
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate as string);
      if (endDate) whereClause.createdAt.lte = new Date(endDate as string);
    }

    // Role visibility
    if (req.user?.role === 'ASSOCIATE') {
      const downlineIds = await getDownlineIds(req.user.id);
      const allowedIds = [req.user.id, ...downlineIds];
      whereClause.associateId = { in: allowedIds };
    }

    const commissions = await prisma.commissionLedger.findMany({
      where: whereClause,
      include: {
        associate: { select: { name: true, userId: true } },
        project: { select: { name: true } },
        booking: { select: { id: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, commissions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCommissionStats = async (req: AuthRequest, res: Response) => {
  try {
    let whereClause: any = {};
    if (req.user?.role === 'ASSOCIATE') {
      const downlineIds = await getDownlineIds(req.user.id);
      const allowedIds = [req.user.id, ...downlineIds];
      whereClause.associateId = { in: allowedIds };
    }

    const commissions = await prisma.commissionLedger.findMany({ where: whereClause, select: { amount: true, paymentStatus: true } });

    let stats = { total: 0, received: 0, pending: 0, due: 0 };
    commissions.forEach((c: any) => {
      const amt = parseFloat(c.amount) || 0;
      stats.total += amt;
      if (c.paymentStatus === 'PAID') stats.received += amt;
      else if (c.paymentStatus === 'DUE') stats.due += amt;
      else if (c.paymentStatus === 'PENDING') stats.pending += amt;
    });

    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const recordCommission = async (req: AuthRequest, res: Response) => {
  try {
    const { associateId, bookingId, projectId, amount, type, percentageValue, referenceRemarks } = req.body;
    
    const commission = await prisma.commissionLedger.create({
      data: {
        associateId,
        bookingId: bookingId || null,
        projectId: projectId || null,
        amount,
        type,
        percentageValue,
        referenceRemarks
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'COMMISSION_RECORDED',
        userId: req.user!.id,
        details: JSON.stringify({ recordId: commission.id, role: req.user!.role, newValue: { amount, associateId } })
      }
    });

    res.json({ success: true, commission });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCommissionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const data: any = { paymentStatus };
    if (paymentStatus === 'PAID') data.paymentDate = new Date();

    const oldCommission = await prisma.commissionLedger.findUnique({ where: { id: id as string } });
    const commission = await prisma.commissionLedger.update({
      where: { id: id as string },
      data
    });

    if (commission && oldCommission) {
      await prisma.auditLog.create({
        data: {
          action: 'COMMISSION_STATUS_UPDATED',
          userId: req.user!.id,
          details: JSON.stringify({ recordId: commission.id, role: req.user!.role, previousValue: { status: oldCommission.paymentStatus }, newValue: { status: paymentStatus } })
        }
      });
    }

    res.json({ success: true, commission });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const requestConfigChange = async (req: AuthRequest, res: Response) => {
  try {
    const { associateId } = req.params;
    const { newConfig } = req.body;

    // Create an ApprovalRequest for the MD
    const request = await prisma.approvalRequest.create({
      data: {
        type: 'COMMISSION_CHANGE',
        status: 'PENDING_MD',
        requestedById: req.user!.id,
        targetUserId: associateId as string,
        payload: JSON.stringify(newConfig)
      }
    });

    res.json({ success: true, request });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
