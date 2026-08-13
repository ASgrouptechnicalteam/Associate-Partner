import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const createPromotion = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      type, title, description, ctaText, ctaLink, projectId, 
      startDate, endDate, displayOrder, isActive,
      offerType, discountAmount, discountPercentage, 
      bonusAmount, commissionBonus, otherBenefit, termsAndConditions 
    } = req.body;
    
    let imageUrl = undefined;
    if (req.file) {
      imageUrl = '/uploads/' + req.file.filename;
    }

    const promotion = await prisma.promotion.create({
      data: {
        type,
        title,
        description,
        ctaText,
        ctaLink,
        projectId: projectId || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        isActive: isActive === 'true' || isActive === true,
        imageUrl,
        offerType,
        discountAmount,
        discountPercentage,
        bonusAmount,
        commissionBonus,
        otherBenefit,
        termsAndConditions
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'PROMOTION_CREATED',
        userId: req.user!.id,
        details: JSON.stringify({ recordId: promotion.id, role: req.user!.role, newValue: { title, type } })
      }
    });

    res.json({ success: true, promotion });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPromotions = async (req: AuthRequest, res: Response) => {
  try {
    // Only AM/MD can get ALL promotions
    if (req.user?.role !== 'AM' && req.user?.role !== 'MD') return res.status(403).json({ error: 'Unauthorized' });

    const promotions = await prisma.promotion.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    res.json({ success: true, promotions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePromotion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      type, title, description, ctaText, ctaLink, projectId, 
      startDate, endDate, displayOrder, isActive,
      offerType, discountAmount, discountPercentage, 
      bonusAmount, commissionBonus, otherBenefit, termsAndConditions 
    } = req.body;

    const data: any = {
      type, title, description, ctaText, ctaLink,
      projectId: projectId || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      offerType, discountAmount, discountPercentage, 
      bonusAmount, commissionBonus, otherBenefit, termsAndConditions
    };

    if (displayOrder !== undefined) data.displayOrder = parseInt(displayOrder);
    if (isActive !== undefined) data.isActive = isActive === 'true' || isActive === true;
    
    if (req.file) {
      data.imageUrl = '/uploads/' + req.file.filename;
    }

    const promotion = await prisma.promotion.update({
      where: { id: String(id) },
      data
    });

    await prisma.auditLog.create({
      data: {
        action: 'PROMOTION_UPDATED',
        userId: req.user!.id,
        details: JSON.stringify({ recordId: id, role: req.user!.role, newValue: { title, type } })
      }
    });

    res.json({ success: true, promotion });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getActivePromotions = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          }
        ]
      },
      orderBy: { displayOrder: 'asc' }
    });

    // Group by type for easy frontend consumption
    const grouped = promotions.reduce((acc: any, curr) => {
      if (!acc[curr.type]) acc[curr.type] = [];
      acc[curr.type].push(curr);
      return acc;
    }, {});

    res.json({ success: true, promotions: grouped });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePromotion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.promotion.delete({ where: { id: id as string } });
    
    await prisma.auditLog.create({
      data: {
        action: 'PROMOTION_DELETED',
        userId: req.user!.id,
        details: JSON.stringify({ recordId: id, role: req.user!.role })
      }
    });
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const togglePromotion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    await prisma.promotion.update({
      where: { id: id as string },
      data: { isActive }
    });
    
    await prisma.auditLog.create({
      data: {
        action: 'PROMOTION_TOGGLED',
        userId: req.user!.id,
        details: JSON.stringify({ recordId: id, role: req.user!.role, newValue: { isActive } })
      }
    });
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const reorderPromotions = async (req: AuthRequest, res: Response) => {
  try {
    const { orderedIds } = req.body; // array of IDs
    // Prisma doesn't have a single bulk update with different values easily, so loop
    for (let i = 0; i < orderedIds.length; i++) {
      await prisma.promotion.update({
        where: { id: orderedIds[i] },
        data: { displayOrder: i }
      });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
