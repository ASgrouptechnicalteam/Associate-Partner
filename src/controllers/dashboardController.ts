import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const getDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user!.role; // MD, AM, ASSOCIATE
    const userId = req.user!.id;
    
    const stats: any = {};
    const recentActivity: any[] = [];
    let pendingActions: any[] = [];

    // Associate Overview
    if (userRole === 'MD' || userRole === 'AM') {
      const count = await prisma.user.count({ where: { role: 'ASSOCIATE' } });
      stats.totalAssociates = count > 0 ? count : null;
      stats.activeAssociates = await prisma.user.count({ where: { role: 'ASSOCIATE', isActive: true } });
      stats.pendingAssociates = await prisma.approvalRequest.count({ 
        where: { 
          type: 'NEW_ASSOCIATE', 
          status: userRole === 'MD' ? 'PENDING_MD' : 'PENDING_AM' 
        } 
      });
      
      const pendingAssoc = stats.pendingAssociates;
      if (pendingAssoc > 0) {
        pendingActions.push({ title: `${pendingAssoc} Associate request${pendingAssoc > 1 ? 's' : ''}`, link: '/approval-center' });
      }
    } else {
      const count = await prisma.user.count({ where: { parentAssociateId: userId } });
      stats.totalAssociates = count > 0 ? count : null;
    }

    // Business Overview
    const projCount = await prisma.project.count();
    stats.totalProjects = projCount > 0 ? projCount : null;
    stats.activeProjects = await prisma.project.count({ where: { status: 'PUBLISHED' } });
    
    const bookCount = userRole === 'ASSOCIATE' 
      ? await prisma.booking.count({ where: { associateId: userId } })
      : await prisma.booking.count();
    stats.totalBookings = bookCount > 0 ? bookCount : null;

    const pendingBookings = userRole === 'ASSOCIATE'
      ? await prisma.booking.count({ where: { associateId: userId, status: 'PENDING_AM' } })
      : await prisma.booking.count({ where: { status: 'PENDING_AM' } });

    if (pendingBookings > 0 && (userRole === 'AM' || userRole === 'MD')) {
      pendingActions.push({ title: `${pendingBookings} Booking approval${pendingBookings > 1 ? 's' : ''}`, link: '/bookings' });
    }

    // Site Visits
    const visitsCount = userRole === 'ASSOCIATE'
      ? await prisma.siteVisit.count({ where: { associateId: userId } })
      : await prisma.siteVisit.count();
    stats.siteVisits = visitsCount > 0 ? visitsCount : null;

    // Commissions
    const ledgers = userRole === 'ASSOCIATE'
      ? await prisma.commissionLedger.findMany({ where: { associateId: userId, paymentStatus: 'PAID' }, select: { amount: true } })
      : await prisma.commissionLedger.findMany({ where: { paymentStatus: 'PAID' }, select: { amount: true } });
      
    if (ledgers.length === 0) {
      stats.totalCommission = null;
    } else {
      let totalCommission = 0;
      for (const ledg of ledgers) {
        const amt = parseFloat(ledg.amount.replace(/,/g, ''));
        if (!isNaN(amt)) totalCommission += amt;
      }
      stats.totalCommission = totalCommission; // If this sums to 0, it legitimately passes as 0
    }

    // Fetch Active Carousel
    const carousels = await prisma.dashboardCarousel.findMany({
      where: { isActive: true, isPublished: true },
      orderBy: [{ displayOrder: 'asc' }]
    });

    // Fetch Published Popup
    const popup = await prisma.dashboardPopup.findFirst({
      where: { isPublished: true },
      orderBy: { updatedAt: 'desc' }
    });

    const offers = await prisma.dashboardOffer.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
      take: 4
    });

    const announcements = await prisma.announcement.findMany({
      where: { 
        isActive: true,
        OR: [
          { targetRole: 'ALL' },
          { targetRole: userRole }
        ]
      },
      orderBy: { priority: 'desc' },
      include: {
        dismissals: {
          where: { userId: userId }
        }
      }
    });

    // Recent Activity (Audit logs or bookings)
    const recentLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });
    
    recentLogs.forEach((log: any) => {
      recentActivity.push({
        text: `${log.user.name} ${log.action}`,
        time: log.createdAt
      });
    });

    // Featured Projects
    const featuredProjects = await prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      stats,
      carousels,
      popup,
      offers,
      announcements,
      pendingActions,
      recentActivity,
      featuredProjects
    });

  } catch (error: any) {
    console.error('Error fetching dashboard data', error);
    res.status(500).json({ error: error.message });
  }
};
