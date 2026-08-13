import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { StorageService } from '../services/storageService';

const prisma = new PrismaClient();

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { profile: true, sessions: { orderBy: { createdAt: 'desc' }, take: 5 } }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mask sensitive bank details
    if (user.profile && user.profile.accountNo) {
      const acc = user.profile.accountNo;
      user.profile.accountNo = acc.length > 4 ? 'XXXX-XXXX-' + acc.slice(-4) : 'XXXX';
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const body = req.body;

    const profileData: any = {
      primaryPhone: body.primaryPhone,
      whatsappNumber: body.whatsappNumber,
      email: body.email,
      bloodGroup: body.bloodGroup,
      secondaryPhone: body.secondaryPhone,
      emergencyContact: body.emergencyContact,
      currentAddress: body.currentAddress,
      permanentAddress: body.permanentAddress,
      aadhaar: body.aadhaar,
      pan: body.pan,
      accountHolder: body.accountHolder,
      bank: body.bank,
      ifsc: body.ifsc,
      branch: body.branch
    };

    // Keep actual accountNo if not masked or provided empty
    if (body.accountNo && !body.accountNo.includes('XXXX')) {
      profileData.accountNo = body.accountNo;
    }

    if (files) {
      // Profile Photo is public
      if (files['profilePhoto']) {
        profileData.profilePhoto = await StorageService.uploadFile(files['profilePhoto'][0].path, files['profilePhoto'][0].filename, false);
      }
      // Aadhaar and PAN are private
      if (files['aadhaarFile']) {
        profileData.aadhaarFile = await StorageService.uploadFile(files['aadhaarFile'][0].path, files['aadhaarFile'][0].filename, true);
      }
      if (files['panFile']) {
        profileData.panFile = await StorageService.uploadFile(files['panFile'][0].path, files['panFile'][0].filename, true);
      }
    }

    await prisma.profile.upsert({
      where: { userId: req.user!.id },
      update: profileData,
      create: {
        userId: req.user!.id,
        ...profileData
      }
    });

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    StorageService.cleanupLocalFiles(req.files as any);
  }
};
