import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Helper to get recursive downline IDs
async function getDownlineIds(parentId: string): Promise<string[]> {
  const children = await prisma.user.findMany({ where: { parentAssociateId: parentId }, select: { id: true } });
  let ids: string[] = [];
  for (const child of children) {
    ids.push(child.id);
    ids = ids.concat(await getDownlineIds(child.id));
  }
  return ids;
}

export const createSiteVisit = async (req: AuthRequest, res: Response) => {
  try {
    const { customerName, customerPhone, projectId, date, time, numVisitors, purpose, notes } = req.body;
    
    const visit = await prisma.siteVisit.create({
      data: {
        associateId: req.user!.id,
        projectId,
        customerName,
        customerPhone,
        date: new Date(date),
        time,
        numVisitors: parseInt(numVisitors) || 1,
        purpose,
        notes
      }
    });

    res.json({ success: true, visit });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getSiteVisits = async (req: AuthRequest, res: Response) => {
  try {
    let whereClause: any = {};

    // Role visibility (Own + Downline)
    if (req.user?.role === 'ASSOCIATE') {
      const downlineIds = await getDownlineIds(req.user.id);
      const allowedIds = [req.user.id, ...downlineIds];
      whereClause.associateId = { in: allowedIds };
    }

    const visits = await prisma.siteVisit.findMany({
      where: whereClause,
      include: {
        associate: { select: { name: true, userId: true } },
        project: { select: { name: true } }
      },
      orderBy: { date: 'desc' }
    });

    res.json({ success: true, visits });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSiteVisitStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const visit = await prisma.siteVisit.update({
      where: { id: id as string },
      data: { status }
    });

    res.json({ success: true, visit });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const submitPostVisit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { outcome, customerInterest, propertyViewed, followUpRequired, followUpDate, remarks } = req.body;

    const data: any = {
      status: 'COMPLETED',
      outcome,
      customerInterest,
      propertyViewed,
      followUpRequired: followUpRequired === 'true' || followUpRequired === true,
      remarks
    };

    if (followUpDate) data.followUpDate = new Date(followUpDate);

    const visit = await prisma.siteVisit.update({
      where: { id: id as string },
      data
    });

    res.json({ success: true, visit });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
