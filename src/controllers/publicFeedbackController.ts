import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createNotification } from './notificationController';

const prisma = new PrismaClient();

export const getFeedbackPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const review = await prisma.customerReview.findUnique({
      where: { id: id as string },
      include: {
        associate: { select: { name: true } },
        project: { select: { name: true } }
      }
    });

    if (!review) {
      return res.status(404).send('Review request not found.');
    }

    if (review.isSubmitted) {
      return res.render('public/feedback-thank-you', { review });
    }

    res.render('public/feedback', { review });
  } catch (error: any) {
    res.status(500).send('Internal Server Error');
  }
};

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { overallRating, communicationRating, propertyExperienceRating, writtenReview } = req.body;

    const review = await prisma.customerReview.findUnique({ where: { id: id as string } });
    if (!review) return res.status(404).json({ error: 'Not found' });
    if (review.isSubmitted) return res.status(403).json({ error: 'Review has already been submitted and is immutable.' });

    const updated = await prisma.customerReview.update({
      where: { id: id as string },
      data: {
        overallRating: parseInt(overallRating) || null,
        communicationRating: parseInt(communicationRating) || null,
        propertyExperienceRating: parseInt(propertyExperienceRating) || null,
        writtenReview,
        isSubmitted: true
      }
    });

    await createNotification(
      updated.associateId,
      'Review',
      `You received a new ${updated.overallRating}-star review from ${updated.customerName}!`,
      '/reviews'
    );

    await prisma.auditLog.create({
      data: {
        action: 'REVIEW_SUBMITTED',
        userId: updated.associateId, // Record against associate
        details: JSON.stringify({ recordId: updated.id, role: 'CUSTOMER', newValue: { overallRating } })
      }
    });

    res.json({ success: true, review: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
