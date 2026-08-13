import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { createNotification } from './notificationController';
import { StorageService } from '../services/storageService';

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

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { customerName, customerPhone, customerAltPhone, customerEmail, customerAddress, 
            projectId, unitId, propertyType, size, price, bookingDate, bookingAmount, expectedAmount, paymentMode, notes } = req.body;
    
    let documents: string[] = [];
    if (req.files) {
      const filesArray = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (filesArray['documents']) {
        for (const file of filesArray['documents']) {
          const docPath = await StorageService.uploadFile(file.path, file.filename, true);
          documents.push(docPath);
        }
      }
    }

    // Transaction to lock the unit securely
    const booking = await prisma.$transaction(async (tx) => {
      const unit = await tx.inventoryUnit.findUnique({ where: { id: unitId } });
      if (!unit || unit.status !== 'AVAILABLE') {
        throw new Error('Unit is not available for booking.');
      }

      // Lock it
      await tx.inventoryUnit.update({
        where: { id: unitId },
        data: { status: 'RESERVED' }
      });

      const newBooking = await tx.booking.create({
        data: {
          customerName, customerPhone, customerAltPhone, customerEmail, customerAddress,
          projectId, unitId, propertyType, size, price,
          bookingDate: new Date(bookingDate),
          bookingAmount, expectedAmount, paymentMode, notes,
          documents: JSON.stringify(documents),
          associateId: req.user!.id
        }
      });
      
      await tx.auditLog.create({
        data: {
          action: 'BOOKING_CREATED',
          userId: req.user!.id,
          details: JSON.stringify({ recordId: newBooking.id, role: req.user!.role, newValue: { projectId, unitId, expectedAmount } })
        }
      });
      
      return newBooking;
    });

    res.json({ success: true, booking });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  } finally {
    StorageService.cleanupLocalFiles(req.files as any);
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { status, projectId, date } = req.query;
    let whereClause: any = {};

    if (status) whereClause.status = status;
    if (projectId) whereClause.projectId = projectId;
    
    // Filtering by day
    if (date) {
      const startOfDay = new Date(date as string);
      const endOfDay = new Date(date as string);
      endOfDay.setDate(endOfDay.getDate() + 1);
      whereClause.bookingDate = { gte: startOfDay, lt: endOfDay };
    }

    // Role visibility
    if (req.user?.role === 'ASSOCIATE') {
      const downlineIds = await getDownlineIds(req.user.id);
      const allowedIds = [req.user.id, ...downlineIds];
      whereClause.associateId = { in: allowedIds };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        project: { select: { name: true } },
        unit: { select: { identifier: true } },
        associate: { select: { name: true, userId: true } }
      },
      orderBy: { bookingDate: 'desc' }
    });

    res.json({ success: true, bookings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: id as string } });
      if (!booking || booking.status !== 'PENDING_AM') throw new Error('Invalid booking state');

      await tx.booking.update({ where: { id: id as string }, data: { status: 'CONFIRMED' } });
      await tx.inventoryUnit.update({ where: { id: booking.unitId }, data: { status: 'BOOKED' } });
      
      await tx.auditLog.create({
        data: {
          action: 'BOOKING_VERIFIED',
          userId: req.user!.id,
          details: JSON.stringify({ recordId: booking.id, role: req.user!.role, previousValue: { status: booking.status }, newValue: { status: 'CONFIRMED' } })
        }
      });
      
      await createNotification(
        booking.associateId,
        'Booking',
        `Your booking for ${booking.customerName} has been verified and confirmed.`,
        '/bookings'
      );
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const rejectBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: id as string } });
      if (!booking || booking.status !== 'PENDING_AM') throw new Error('Invalid booking state');

      await tx.booking.update({ where: { id: id as string }, data: { status: 'REJECTED' } });
      // Unlock unit
      await tx.inventoryUnit.update({ where: { id: booking.unitId }, data: { status: 'AVAILABLE' } });
      
      await tx.auditLog.create({
        data: {
          action: 'BOOKING_REJECTED',
          userId: req.user!.id,
          details: JSON.stringify({ recordId: booking.id, role: req.user!.role, previousValue: { status: booking.status }, newValue: { status: 'REJECTED' } })
        }
      });

      await createNotification(
        booking.associateId,
        'Booking',
        `Your booking for ${booking.customerName} has been rejected.`,
        '/bookings'
      );
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
