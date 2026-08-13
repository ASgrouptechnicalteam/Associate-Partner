import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { StorageService } from '../services/storageService';
import mime from 'mime-types';
import path from 'path';

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

export const downloadPrivateDocument = async (req: AuthRequest, res: Response) => {
  try {
    const filename = req.params.filename as string;
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const user = req.user!;
    let ownerId: string | null = null;
    let allowedToView = false;

    // 1. Check Profile (KYC Docs)
    const profile = await prisma.profile.findFirst({
      where: {
        OR: [
          { aadhaarFile: { contains: filename } },
          { panFile: { contains: filename } }
        ]
      }
    });

    if (profile) {
      ownerId = profile.userId;
      // MD/AM can view all. Associate can only view own.
      if (user.role === 'MD' || user.role === 'AM' || user.id === ownerId) allowedToView = true;
    } else {
      // 2. Check Travel Allowance (Travel Bill)
      const travel = await prisma.travelAllowance.findFirst({
        where: { supportingBill: { contains: filename } }
      });

      if (travel) {
        ownerId = travel.associateId;
        if (user.role === 'MD' || user.role === 'AM' || user.id === ownerId) allowedToView = true;
      } else {
        // 3. Check Booking (Booking Documents)
        const booking = await prisma.booking.findFirst({
          where: { documents: { contains: filename } }
        });

        if (booking) {
          ownerId = booking.associateId;
          if (user.role === 'MD' || user.role === 'AM' || user.id === ownerId) {
            allowedToView = true;
          } else if (user.role === 'ASSOCIATE') {
            const downlineIds = await getDownlineIds(user.id);
            if (downlineIds.includes(ownerId)) allowedToView = true;
          }
        }
      }
    }

    if (!ownerId) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!allowedToView) {
      return res.status(403).json({ error: 'Unauthorized to view this document' });
    }

    const fileRef = `private://${filename}`;
    const stream = await StorageService.getFileStream(fileRef);

    if (!stream) {
      return res.status(404).json({ error: 'Document file missing in storage' });
    }

    const ext = path.extname(filename);
    const contentType = (mime.lookup(ext) as string) || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    stream.pipe(res);
  } catch (error: any) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
};
