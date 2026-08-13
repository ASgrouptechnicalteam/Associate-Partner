import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { createNotification } from './notificationController';

const prisma = new PrismaClient();

export const getPendingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    let statusFilter = '';
    
    if (role === 'MD') statusFilter = 'PENDING_MD';
    else if (role === 'AM') statusFilter = 'PENDING_AM';
    else return res.status(403).json({ error: 'Unauthorized' });

    const requests = await prisma.approvalRequest.findMany({
      where: { status: statusFilter },
      include: {
        requestedBy: { select: { name: true, userId: true } },
        targetUser: { select: { name: true, userId: true, profile: true } }
      }
    });

    res.json({ success: true, requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getApprovalHistory = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'MD' && role !== 'AM') return res.status(403).json({ error: 'Unauthorized' });

    const history = await prisma.approvalRequest.findMany({
      where: { status: { in: ['APPROVED', 'REJECTED'] } },
      orderBy: { resolvedAt: 'desc' },
      include: {
        requestedBy: { select: { name: true, userId: true } },
        targetUser: { select: { name: true, userId: true } },
        approver: { select: { name: true, userId: true } }
      }
    });

    res.json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const approveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const request = await prisma.approvalRequest.findUnique({ where: { id: id as string } });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const role = req.user?.role;

    if (role === 'AM' && request.status === 'PENDING_AM') {
      // AM approves a referral, now it moves to PENDING_MD
      // Payload has referral form data. AM should have provided commissionConfig too.
      await prisma.approvalRequest.update({
        where: { id: id as string },
        data: { status: 'PENDING_MD', approverId: req.user!.id, resolvedAt: new Date() }
      });
      await prisma.auditLog.create({
        data: {
          action: 'FORWARDED_TO_MD',
          userId: req.user!.id,
          details: JSON.stringify({ recordId: request.id, role: req.user!.role, type: request.type })
        }
      });
      
      if (request.requestedById) {
        await createNotification(
          request.requestedById,
          'Approval',
          `Your request was approved by AM and forwarded to MD.`,
          '/approval-center'
        );
      }
      
      return res.json({ success: true, message: 'Approved. Forwarded to MD.' });
    }

    if (role === 'MD' && request.status === 'PENDING_MD') {
      // Handle NEW_ASSOCIATE vs PROJECT_APPROVAL vs COMMISSION_CHANGE
      if (request.type === 'COMMISSION_CHANGE' && request.payload && request.targetUserId) {
        try {
          await prisma.profile.update({
            where: { userId: request.targetUserId },
            data: { commissionConfig: request.payload }
          });
        } catch(e) {}
      } else if (request.type === 'PROJECT_APPROVAL' && request.payload) {
        try {
          const payloadData = JSON.parse(request.payload);
          if (payloadData.projectId) {
            await prisma.project.update({
              where: { id: payloadData.projectId },
              data: { status: 'APPROVED' }
            });
          }
        } catch (e) {}
      } else if (request.targetUserId) {
        await prisma.user.update({
          where: { id: request.targetUserId },
          data: { isActive: true }
        });
      }

      await prisma.approvalRequest.update({
        where: { id: id as string },
        data: { status: 'APPROVED', approverId: req.user!.id, resolvedAt: new Date() }
      });
      await prisma.auditLog.create({
        data: {
          action: 'APPROVED_REQUEST',
          userId: req.user!.id,
          details: JSON.stringify({ recordId: request.id, role: req.user!.role, type: request.type, targetUserId: request.targetUserId })
        }
      });
      
      if (request.requestedById) {
        await createNotification(
          request.requestedById,
          'Approval',
          `Your ${request.type} request was approved by the MD.`,
          '/approval-center'
        );
      }
      
      return res.json({ success: true, message: 'Approved. Associate activated.' });
    }

    res.status(400).json({ error: 'Invalid approval state' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const rejectRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const request = await prisma.approvalRequest.findUnique({ where: { id: id as string } });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    await prisma.approvalRequest.update({
      where: { id: id as string },
      data: { status: 'REJECTED', rejectionReason: (reason as string) || 'Rejected by management', approverId: req.user!.id, resolvedAt: new Date() }
    });
    
    await prisma.auditLog.create({
      data: {
        action: 'REJECTED_REQUEST',
        userId: req.user!.id,
        details: JSON.stringify({ recordId: request.id, role: req.user!.role, type: request.type, rejectionReason: reason || 'None' })
      }
    });
    
    if (request.requestedById) {
      await createNotification(
        request.requestedById,
        'Approval',
        `Your ${request.type} request was rejected by the management.`,
        '/approval-center'
      );
    }

    res.json({ success: true, message: 'Request rejected.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
