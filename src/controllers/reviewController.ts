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

export const requestReview = async (req: AuthRequest, res: Response) => {
  try {
    const { customerName, customerPhone, customerEmail, projectId, bookingId, interactionDate, interactionSummary } = req.body;
    
    const review = await prisma.customerReview.create({
      data: {
        associateId: req.user!.id,
        customerName,
        customerPhone,
        customerEmail,
        projectId: projectId || null,
        bookingId: bookingId || null,
        interactionDate: new Date(interactionDate),
        interactionSummary
      }
    });

    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3000';
    const reviewLink = `${protocol}://${host}/feedback/${review.id}`;

    res.json({ success: true, review, link: reviewLink });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getReviews = async (req: AuthRequest, res: Response) => {
  try {
    let whereClause: any = { isSubmitted: true };

    if (req.user?.role === 'ASSOCIATE') {
      const downlineIds = await getDownlineIds(req.user.id);
      const allowedIds = [req.user.id, ...downlineIds];
      whereClause.associateId = { in: allowedIds };
    }

    const reviews = await prisma.customerReview.findMany({
      where: whereClause,
      include: {
        associate: { select: { name: true, userId: true } },
        project: { select: { name: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ success: true, reviews });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReviewStats = async (req: AuthRequest, res: Response) => {
  try {
    let whereClause: any = { isSubmitted: true };

    if (req.user?.role === 'ASSOCIATE') {
      const downlineIds = await getDownlineIds(req.user.id);
      const allowedIds = [req.user.id, ...downlineIds];
      whereClause.associateId = { in: allowedIds };
    }

    const reviews = await prisma.customerReview.findMany({
      where: whereClause,
      select: { overallRating: true }
    });

    const total = reviews.length;
    let sum = 0;
    let fiveStarCount = 0;
    
    reviews.forEach((r: any) => {
      const rating = r.overallRating || 0;
      sum += rating;
      if (rating === 5) fiveStarCount++;
    });

    const avg = total > 0 ? (sum / total).toFixed(1) : 0;
    const distribution = total > 0 ? Math.round((fiveStarCount / total) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalReviews: total,
        averageRating: avg,
        fiveStarPercentage: distribution
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
