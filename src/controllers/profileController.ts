import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

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

export const getEditProfilePage = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { profile: true }
    });

    if (!user) {
      return res.redirect('/login?error=user_not_found');
    }

    res.render('pages/profile-edit', {
      title: 'Edit Profile',
      activePath: '/profile',
      user: user,
      profile: user.profile || {}
    });
  } catch (error: any) {
    console.error('Error loading edit profile page:', error);
    res.status(500).send('An error occurred while loading the profile.');
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
      if (files['profilePhoto']) profileData.profilePhoto = '/uploads/' + files['profilePhoto'][0].filename;
      if (files['aadhaarFile']) profileData.aadhaarFile = '/uploads/' + files['aadhaarFile'][0].filename;
      if (files['panFile']) profileData.panFile = '/uploads/' + files['panFile'][0].filename;
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
  }
};
