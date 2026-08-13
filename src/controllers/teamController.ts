import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Recursive fetcher for full tree (with PII stripping)
async function getDownlineTree(parentId: string | null): Promise<any[]> {
  const whereClause = parentId === null 
    ? { 
        role: 'ASSOCIATE',
        OR: [
          { parentAssociateId: null },
          { parentAssociate: { role: { in: ['MD', 'AM'] } } }
        ]
      }
    : { parentAssociateId: parentId };

  const children = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      userId: true,
      name: true,
      isActive: true,
      createdAt: true,
      profile: {
        select: {
          commissionConfig: true,
          joiningDate: true,
          profilePhoto: true,
          primaryPhone: true,
          email: true,
          currentAddress: true,
          aadhaar: true,
          pan: true
        }
      },
      parentAssociate: {
        select: {
          name: true,
          role: true
        }
      },
      bookings: {
        select: { id: true, status: true, bookingAmount: true }
      },
      commissionLedgers: {
        select: { amount: true, paymentStatus: true }
      },
      siteVisits: {
        select: { id: true }
      },
      sessions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true }
      }
    }
  });

  let tree: any[] = [];
  for (const child of children) {
    const downline = await getDownlineTree(child.id);
    
    // Calculate stats
    const totalBookings = child.bookings.length;
    const totalSales = child.bookings.reduce((sum: number, b: any) => sum + (parseFloat(b.bookingAmount) || 0), 0);
    const totalCommission = child.commissionLedgers.reduce((sum: number, c: any) => sum + (parseFloat(c.amount) || 0), 0);
    const pendingCommission = child.commissionLedgers
      .filter((c: any) => c.paymentStatus === 'PENDING')
      .reduce((sum: number, c: any) => sum + (parseFloat(c.amount) || 0), 0);
    
    const lastLogin = child.sessions.length > 0 ? child.sessions[0].createdAt : null;

    tree.push({
      id: child.id,
      code: child.userId,
      name: child.name,
      status: child.isActive ? 'ACTIVE' : 'INACTIVE',
      createdAt: child.createdAt,
      commission: child.profile?.commissionConfig || 'Default',
      photo: child.profile?.profilePhoto || null,
      phone: child.profile?.primaryPhone || 'N/A',
      email: child.profile?.email || 'N/A',
      location: child.profile?.currentAddress || 'N/A',
      joiningDate: child.profile?.joiningDate || null,
      managerName: child.parentAssociate?.name || 'Unassigned',
      managerRole: child.parentAssociate?.role || '',
      docs: {
        aadhaar: child.profile?.aadhaar ? 'Submitted' : 'Pending',
        pan: child.profile?.pan ? 'Submitted' : 'Pending'
      },
      stats: {
        bookings: totalBookings,
        sales: totalSales,
        siteVisits: child.siteVisits.length,
        commissionEarned: totalCommission,
        commissionPending: pendingCommission
      },
      lastLogin: lastLogin,
      children: downline,
      teamCount: countRecursive(downline)
    });
  }
  return tree;
}

// Helper to count total members recursively
function countRecursive(tree: any[]): number {
  let count = tree.length;
  for (const node of tree) {
    count += countRecursive(node.children);
  }
  return count;
}

// Flat array getter for stats
async function getDownlineIds(parentId: string): Promise<string[]> {
  const children = await prisma.user.findMany({ where: { parentAssociateId: parentId }, select: { id: true } });
  let ids: string[] = [];
  for (const child of children) {
    ids.push(child.id);
    ids = ids.concat(await getDownlineIds(child.id));
  }
  return ids;
}

export const getTeamTree = async (req: AuthRequest, res: Response) => {
  try {
    let targetId: string | null = (req.query.targetId as string) || null;
    
    if (req.user!.role !== 'MD' && req.user!.role !== 'AM') {
      // ASSOCIATE: Must view own tree or downline
      if (!targetId || targetId === req.user!.id) {
        targetId = req.user!.id;
      } else {
        const myDownlineIds = await getDownlineIds(req.user!.id);
        if (!myDownlineIds.includes(targetId)) {
          return res.status(403).json({ error: 'Unauthorized. You cannot view sibling or parent trees.' });
        }
      }
    } else {
      // MD/AM: Default to company root if no targetId provided
      if (!req.query.targetId) {
        targetId = null;
      }
    }

    const tree = await getDownlineTree(targetId);
    res.json({ success: true, tree });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTeamStats = async (req: AuthRequest, res: Response) => {
  try {
    const myId = req.user!.id;
    const role = req.user!.role;

    if (role === 'MD' || role === 'AM') {
      const totalDownline = await prisma.user.count({ where: { role: 'ASSOCIATE' } });
      const directMembers = await prisma.user.count({ 
        where: { 
          role: 'ASSOCIATE', 
          OR: [{ parentAssociateId: null }, { parentAssociate: { role: { in: ['MD', 'AM'] } } }]
        } 
      });
      const teamBookingsCount = await prisma.booking.count();
      const teamCommissions = await prisma.commissionLedger.findMany({ select: { amount: true } });
      const totalTeamCommission = teamCommissions.reduce((sum: number, c: any) => sum + (parseFloat(c.amount) || 0), 0);
      const siteVisitsCount = await prisma.siteVisit.count();
      
      return res.json({
        success: true,
        stats: {
          directMembers, // Top-level roots for MD
          totalDownline,
          teamBookings: teamBookingsCount,
          teamCommission: totalTeamCommission,
          siteVisits: siteVisitsCount
        }
      });
    }

    // Direct members
    const directMembers = await prisma.user.count({ where: { parentAssociateId: myId } });
    
    // Total downline
    const downlineIds = await getDownlineIds(myId);
    const totalDownline = downlineIds.length;

    // Team Bookings
    const teamBookingsCount = await prisma.booking.count({
      where: { associateId: { in: downlineIds } }
    });

    // Team Commission
    const teamCommissions = await prisma.commissionLedger.findMany({
      where: { associateId: { in: downlineIds } },
      select: { amount: true }
    });
    const totalTeamCommission = teamCommissions.reduce((sum: number, c: any) => sum + (parseFloat(c.amount) || 0), 0);

    // Site Visits
    const siteVisitsCount = await prisma.siteVisit.count({
      where: { associateId: { in: downlineIds } }
    });
    
    res.json({
      success: true,
      stats: {
        directMembers,
        totalDownline,
        teamBookings: teamBookingsCount,
        teamCommission: totalTeamCommission,
        siteVisits: siteVisitsCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
