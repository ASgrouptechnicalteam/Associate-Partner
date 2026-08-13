import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { createNotification } from './notificationController';

const prisma = new PrismaClient();

export const createTravelRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { travelDate, fromLocation, toLocation, purpose, projectId, customerName, distance, travelMode, amountRequested, notes } = req.body;
    
    let supportingBill = null;
    if (req.file) {
      supportingBill = '/uploads/' + req.file.filename;
    }

    const travel = await prisma.travelAllowance.create({
      data: {
        associateId: req.user!.id,
        travelDate: new Date(travelDate),
        fromLocation,
        toLocation,
        purpose,
        projectId: projectId || null,
        customerName,
        distance,
        travelMode,
        amountRequested,
        supportingBill,
        notes
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'TRAVEL_REQUEST_CREATED',
        userId: req.user!.id,
        details: JSON.stringify({ recordId: travel.id, role: req.user!.role, newValue: { amountRequested, toLocation } })
      }
    });

    res.json({ success: true, travel });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getTravelRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    let whereClause: any = {};

    // Own-data restriction
    if (req.user?.role === 'ASSOCIATE') {
      whereClause.associateId = req.user.id;
    }

    if (startDate || endDate) {
      whereClause.travelDate = {};
      if (startDate) whereClause.travelDate.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setDate(end.getDate() + 1);
        whereClause.travelDate.lt = end;
      }
    }

    const requests = await prisma.travelAllowance.findMany({
      where: whereClause,
      include: {
        associate: { select: { name: true, userId: true } },
        project: { select: { name: true } }
      },
      orderBy: { travelDate: 'desc' }
    });

    res.json({ success: true, requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTravelStats = async (req: AuthRequest, res: Response) => {
  try {
    let whereClause: any = {};
    if (req.user?.role === 'ASSOCIATE') {
      whereClause.associateId = req.user.id;
    }

    const requests = await prisma.travelAllowance.findMany({ where: whereClause, select: { amountRequested: true, amountApproved: true, status: true } });

    let stats = { approved: 0, paid: 0, pending: 0 };
    requests.forEach((r: any) => {
      if (r.status === 'PENDING') {
        stats.pending += parseFloat(r.amountRequested) || 0;
      } else if (r.status === 'APPROVED') {
        stats.approved += parseFloat(r.amountApproved || r.amountRequested) || 0;
      } else if (r.status === 'PAID') {
        stats.paid += parseFloat(r.amountApproved || r.amountRequested) || 0;
      }
    });

    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTravelStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, amountApproved } = req.body;

    const data: any = { status };
    if (amountApproved) data.amountApproved = amountApproved;
    if (status === 'PAID') data.paymentDate = new Date();

    const oldTravel = await prisma.travelAllowance.findUnique({ where: { id: id as string } });
    const travel = await prisma.travelAllowance.update({
      where: { id: id as string },
      data
    });

    if (travel && oldTravel) {
      await prisma.auditLog.create({
        data: {
          action: 'TRAVEL_STATUS_UPDATED',
          userId: req.user!.id,
          details: JSON.stringify({ recordId: travel.id, role: req.user!.role, previousValue: { status: oldTravel.status, amountApproved: oldTravel.amountApproved }, newValue: { status, amountApproved } })
        }
      });
    }

    if (travel) {
      await createNotification(
        travel.associateId,
        'Travel',
        `Your travel request to ${travel.toLocation} was marked as ${status}.`,
        '/travel'
      );
    }

    res.json({ success: true, travel });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
