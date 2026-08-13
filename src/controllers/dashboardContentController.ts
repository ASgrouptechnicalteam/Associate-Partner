import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Helper to stringify body props safely
const s = (val: any) => val ? String(val) : null;
const so = (val: any) => val ? String(val) : undefined;
const num = (val: any) => val ? parseInt(String(val)) : 0;
const numo = (val: any) => val !== undefined ? parseInt(String(val)) : undefined;
const d = (val: any) => val ? new Date(String(val)) : null;
const do_ = (val: any) => val ? new Date(String(val)) : undefined;

// CAROUSEL
export const getCarousels = async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.dashboardCarousel.findMany({ orderBy: { displayOrder: 'asc' } });
    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPublishedCarousels = async (req: Request, res: Response) => {
  try {
    const items = await prisma.dashboardCarousel.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: 'asc' }
    });
    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createCarousel = async (req: AuthRequest, res: Response) => {
  try {
    let imagePath = String(req.body.image || '');
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }
    const item = await prisma.dashboardCarousel.create({
      data: {
        title: s(req.body.title),
        subtitle: s(req.body.subtitle),
        description: s(req.body.description),
        image: imagePath,
        type: String(req.body.type || 'PROMOTION'),
        projectId: s(req.body.projectId),
        ctaText: s(req.body.ctaText),
        ctaUrl: s(req.body.ctaUrl),
        priority: num(req.body.priority),
        displayOrder: num(req.body.displayOrder),
        isActive: req.body.isActive === 'true' || req.body.isActive === true,
        isPublished: req.body.isPublished === 'true' || req.body.isPublished === true,
        startDate: d(req.body.startDate),
        endDate: d(req.body.endDate),
        createdBy: req.user!.name
      }
    });
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateCarousel = async (req: AuthRequest, res: Response) => {
  try {
    const dataToUpdate: any = {
      title: s(req.body.title),
      subtitle: s(req.body.subtitle),
      description: s(req.body.description),
      type: so(req.body.type),
      projectId: s(req.body.projectId),
      ctaText: s(req.body.ctaText),
      ctaUrl: s(req.body.ctaUrl),
      priority: numo(req.body.priority),
      displayOrder: numo(req.body.displayOrder),
      startDate: do_(req.body.startDate),
      endDate: do_(req.body.endDate),
      updatedBy: req.user!.name
    };
    if (req.file) {
      dataToUpdate.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      dataToUpdate.image = so(req.body.image);
    }
    if (req.body.isActive !== undefined) {
      dataToUpdate.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }
    if (req.body.isPublished !== undefined) {
      dataToUpdate.isPublished = req.body.isPublished === 'true' || req.body.isPublished === true;
    }

    const item = await prisma.dashboardCarousel.update({
      where: { id: String(req.params.id) },
      data: dataToUpdate
    });
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const reorderCarousels = async (req: AuthRequest, res: Response) => {
  try {
    const { items } = req.body;
    if (Array.isArray(items)) {
      for (const item of items) {
        await prisma.dashboardCarousel.update({
          where: { id: String(item.id) },
          data: { displayOrder: parseInt(String(item.displayOrder)) }
        });
      }
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteCarousel = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.dashboardCarousel.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// OFFERS
export const getOffers = async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.dashboardOffer.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createOffer = async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.dashboardOffer.create({
      data: {
        title: String(req.body.title),
        description: s(req.body.description),
        image: s(req.body.image),
        offerType: String(req.body.offerType),
        discount: s(req.body.discount),
        commissionBonus: s(req.body.commissionBonus),
        projectId: s(req.body.projectId),
        terms: s(req.body.terms),
        priority: num(req.body.priority),
        isActive: req.body.isActive === 'true' || req.body.isActive === true,
        startDate: d(req.body.startDate),
        endDate: d(req.body.endDate),
        createdBy: req.user!.name
      }
    });
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateOffer = async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.dashboardOffer.update({
      where: { id: String(req.params.id) },
      data: {
        title: so(req.body.title),
        description: s(req.body.description),
        image: s(req.body.image),
        offerType: so(req.body.offerType),
        discount: s(req.body.discount),
        commissionBonus: s(req.body.commissionBonus),
        projectId: s(req.body.projectId),
        terms: s(req.body.terms),
        priority: numo(req.body.priority),
        isActive: req.body.isActive !== undefined ? (req.body.isActive === 'true' || req.body.isActive === true) : undefined,
        startDate: do_(req.body.startDate),
        endDate: do_(req.body.endDate)
      }
    });
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteOffer = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.dashboardOffer.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ANNOUNCEMENTS
export const getAnnouncements = async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.announcement.create({
      data: {
        title: String(req.body.title),
        message: String(req.body.message),
        type: String(req.body.type),
        image: s(req.body.image),
        ctaText: s(req.body.ctaText),
        ctaUrl: s(req.body.ctaUrl),
        priority: req.body.priority ? String(req.body.priority) : "NORMAL",
        displayFrequency: String(req.body.displayFrequency),
        targetRole: String(req.body.targetRole),
        isActive: req.body.isActive === 'true' || req.body.isActive === true,
        startDate: d(req.body.startDate),
        endDate: d(req.body.endDate),
        createdBy: req.user!.name
      }
    });
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.announcement.update({
      where: { id: String(req.params.id) },
      data: {
        title: so(req.body.title),
        message: so(req.body.message),
        type: so(req.body.type),
        image: s(req.body.image),
        ctaText: s(req.body.ctaText),
        ctaUrl: s(req.body.ctaUrl),
        priority: so(req.body.priority),
        displayFrequency: so(req.body.displayFrequency),
        targetRole: so(req.body.targetRole),
        isActive: req.body.isActive !== undefined ? (req.body.isActive === 'true' || req.body.isActive === true) : undefined,
        startDate: do_(req.body.startDate),
        endDate: do_(req.body.endDate)
      }
    });
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.announcement.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Track popup dismissal
export const dismissAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const announcementId = String(req.params.id);
    await prisma.announcementDismissal.upsert({
      where: {
        announcementId_userId: {
          announcementId: announcementId,
          userId: req.user!.id
        }
      },
      create: {
        announcementId: announcementId,
        userId: req.user!.id
      },
      update: {
        dismissedAt: new Date()
      }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POPUPS
export const getPopups = async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.dashboardPopup.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPublishedPopup = async (req: Request, res: Response) => {
  try {
    // Return only the first published one
    const item = await prisma.dashboardPopup.findFirst({
      where: { isPublished: true },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createPopup = async (req: AuthRequest, res: Response) => {
  try {
    let imagePath = so(req.body.image);
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }
    
    const isPublished = req.body.isPublished === 'true' || req.body.isPublished === true;
    if (isPublished) {
      await prisma.dashboardPopup.updateMany({
        data: { isPublished: false }
      });
    }

    const item = await prisma.dashboardPopup.create({
      data: {
        contentType: String(req.body.contentType),
        image: imagePath,
        title: s(req.body.title),
        description: s(req.body.description),
        ctaText: s(req.body.ctaText),
        ctaUrl: s(req.body.ctaUrl),
        isPublished: isPublished,
        createdBy: req.user!.name
      }
    });
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePopup = async (req: AuthRequest, res: Response) => {
  try {
    const dataToUpdate: any = {
      contentType: so(req.body.contentType),
      title: s(req.body.title),
      description: s(req.body.description),
      ctaText: s(req.body.ctaText),
      ctaUrl: s(req.body.ctaUrl),
      updatedBy: req.user!.name
    };
    if (req.body.isPublished !== undefined) {
      dataToUpdate.isPublished = req.body.isPublished === 'true' || req.body.isPublished === true;
    }
    if (req.file) {
      dataToUpdate.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      dataToUpdate.image = so(req.body.image);
    }
    
    if (dataToUpdate.isPublished) {
      await prisma.dashboardPopup.updateMany({
        where: { id: { not: String(req.params.id) } },
        data: { isPublished: false }
      });
    }

    const item = await prisma.dashboardPopup.update({
      where: { id: String(req.params.id) },
      data: dataToUpdate
    });
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deletePopup = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.dashboardPopup.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
