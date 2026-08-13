import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

const generateAssociateCode = async () => {
  const lastUser = await prisma.user.findFirst({
    where: { role: 'ASSOCIATE', userId: { startsWith: 'AP-' } },
    orderBy: { createdAt: 'desc' },
  });

  let nextNumber = 1;
  if (lastUser && lastUser.userId) {
    const parts = lastUser.userId.split('-');
    if (parts.length === 2) {
      nextNumber = parseInt(parts[1], 10) + 1;
    }
  }

  return `AP-${nextNumber.toString().padStart(4, '0')}`;
};

export const createAssociate = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    
    // Only AM or MD can directly create
    if (req.user?.role !== 'AM' && req.user?.role !== 'MD') {
      return res.status(403).json({ error: 'Unauthorized to create associate' });
    }

    const associateCode = await generateAssociateCode();
    const tempPassword = await bcrypt.hash('Associate@123!', 10);

    const newUser = await prisma.user.create({
      data: {
        userId: associateCode,
        passwordHash: tempPassword,
        role: 'ASSOCIATE',
        name: data.name,
        isActive: false, // Requires MD Approval
        isFirstLogin: true,
        parentAssociateId: data.parentAssociateId || null,
        profile: {
          create: {
            primaryPhone: data.primaryPhone,
            secondaryPhone: data.secondaryPhone,
            emergencyContact: data.emergencyContact,
            whatsappNumber: data.whatsappNumber,
            email: data.email,
            bloodGroup: data.bloodGroup,
            currentAddress: data.currentAddress,
            permanentAddress: data.permanentAddress,
            aadhaar: data.aadhaar,
            pan: data.pan,
            accountHolder: data.accountHolder,
            bank: data.bank,
            accountNo: data.accountNo,
            ifsc: data.ifsc,
            branch: data.branch,
            employmentStatus: data.employmentStatus,
            company: data.company,
            designation: data.designation,
            workAddress: data.workAddress,
            experience: data.experience,
            referredBy: req.user.id,
            commissionConfig: data.commissionConfig ? JSON.stringify(data.commissionConfig) : null
          }
        }
      }
    });

    // Create MD Approval Request
    await prisma.approvalRequest.create({
      data: {
        type: 'NEW_ASSOCIATE',
        status: 'PENDING_MD',
        targetUserId: newUser.id,
        requestedById: req.user.id
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'ASSOCIATE_CREATED',
        userId: req.user.id,
        details: JSON.stringify({ recordId: newUser.id, role: req.user.role, newValue: { associateCode, parentAssociateId: data.parentAssociateId } })
      }
    });

    res.json({ success: true, associateCode });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const referAssociate = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    
    await prisma.approvalRequest.create({
      data: {
        type: 'REFERRAL',
        status: 'PENDING_AM',
        requestedById: req.user!.id,
        payload: JSON.stringify(data)
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'ASSOCIATE_REFERRAL_SUBMITTED',
        userId: req.user!.id,
        details: JSON.stringify({ role: req.user!.role, newValue: { referredName: data.name } })
      }
    });

    res.json({ success: true, message: 'Referral submitted for AM review.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Recursive function to get downline
const getDownline = async (userId: string, depth = 3): Promise<any[]> => {
  if (depth === 0) return [];
  const children = await prisma.user.findMany({
    where: { parentAssociateId: userId },
    select: { id: true, name: true, userId: true, isActive: true, role: true }
  });

  const fullChildren = [];
  for (const child of children) {
    fullChildren.push({
      ...child,
      downline: await getDownline(child.id, depth - 1)
    });
  }
  return fullChildren;
};

export const getTeam = async (req: AuthRequest, res: Response) => {
  try {
    // MD and AM see all associates
    if (req.user?.role === 'MD' || req.user?.role === 'AM') {
      const topLevel = await prisma.user.findMany({
        where: { role: 'ASSOCIATE', parentAssociateId: null },
        select: { id: true, name: true, userId: true, isActive: true, role: true }
      });
      
      const team = [];
      for (const t of topLevel) {
        team.push({ ...t, downline: await getDownline(t.id, 5) });
      }
      return res.json({ success: true, team });
    }

    // Associate sees only their downline (not their parent)
    const team = await getDownline(req.user!.id, 5);
    res.json({ success: true, team });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
