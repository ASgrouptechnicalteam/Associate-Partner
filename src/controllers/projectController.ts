import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, location, description, customerOffers, associateOffers } = req.body;
    
    // multer stores files in req.files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const brochureUrl = files['brochure'] ? '/uploads/' + files['brochure'][0].filename : undefined;
    const layoutUrl = files['layout'] ? '/uploads/' + files['layout'][0].filename : undefined;
    
    const galleryPaths = files['gallery'] ? files['gallery'].map(f => '/uploads/' + f.filename) : [];

    const project = await prisma.project.create({
      data: {
        name,
        location,
        description,
        customerOffers,
        associateOffers,
        brochureUrl,
        layoutUrl,
        gallery: JSON.stringify(galleryPaths),
        status: 'DRAFT'
      }
    });

    // Create an ApprovalRequest for MD
    await prisma.approvalRequest.create({
      data: {
        type: 'PROJECT_APPROVAL',
        status: 'PENDING_MD',
        requestedById: req.user!.id,
        payload: JSON.stringify({ projectId: project.id, name })
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'PROJECT_CREATED',
        userId: req.user!.id,
        details: JSON.stringify({ recordId: project.id, role: req.user!.role, newValue: { name, location } })
      }
    });

    res.json({ success: true, project });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Save or create a project draft (wizard)
export const saveProjectDraft = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body;
    const projectId = body.id;
    
    const data: any = {};
    
    // Step 1 fields
    if (body.name !== undefined) data.name = body.name;
    if (body.projectCode !== undefined) data.projectCode = body.projectCode || null;
    if (body.projectType !== undefined) data.projectType = body.projectType;
    if (body.description !== undefined) data.description = body.description;
    if (body.developerName !== undefined) data.developerName = body.developerName;
    if (body.marketingCompany !== undefined) data.marketingCompany = body.marketingCompany;
    if (body.projectStatus !== undefined) data.projectStatus = body.projectStatus;
    if (body.launchDate !== undefined) data.launchDate = body.launchDate ? new Date(body.launchDate) : null;
    if (body.completionDate !== undefined) data.completionDate = body.completionDate ? new Date(body.completionDate) : null;
    if (body.possessionDate !== undefined) data.possessionDate = body.possessionDate ? new Date(body.possessionDate) : null;
    
    // JSON fields (steps 2-14)
    const jsonFields = [
      'locationData', 'legalData', 'landData', 'pricingData', 'paymentPlanData',
      'amenities', 'infrastructure', 'constructionData', 'marketingData',
      'mediaData', 'salesData', 'faqs'
    ];
    jsonFields.forEach(field => {
      if (body[field] !== undefined) {
        data[field] = typeof body[field] === 'string' ? body[field] : JSON.stringify(body[field]);
      }
    });
    
    // Existing fields
    if (body.location !== undefined) data.location = body.location;
    if (body.customerOffers !== undefined) data.customerOffers = body.customerOffers;
    if (body.associateOffers !== undefined) data.associateOffers = body.associateOffers;
    
    // Wizard progress
    if (body.wizardStep !== undefined) data.wizardStep = parseInt(body.wizardStep) || 1;
    
    let project;
    if (projectId) {
      // Update existing draft
      project = await prisma.project.update({
        where: { id: projectId },
        data
      });
    } else {
      // Create new draft
      data.status = 'DRAFT';
      if (!data.name) data.name = 'Untitled Project';
      project = await prisma.project.create({ data });
      
      await prisma.auditLog.create({
        data: {
          action: 'PROJECT_DRAFT_CREATED',
          userId: req.user!.id,
          details: JSON.stringify({ recordId: project.id, role: req.user!.role })
        }
      });
    }
    
    res.json({ success: true, project });
  } catch (error: any) {
    console.error('saveProjectDraft error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Submit project for approval
export const submitProjectForApproval = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.project.findUnique({ where: { id: id as string } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Basic validation
    const missing: string[] = [];
    if (!project.name) missing.push('Project Name');
    if (!project.projectType) missing.push('Project Type');
    if (!project.location && !project.locationData) missing.push('Location');
    
    if (missing.length > 0) {
      return res.status(400).json({ success: false, error: 'Missing required fields', missing });
    }
    
    await prisma.project.update({
      where: { id: id as string },
      data: { status: 'PENDING_MD' }
    });
    
    await prisma.approvalRequest.create({
      data: {
        type: 'PROJECT_APPROVAL',
        status: 'PENDING_MD',
        requestedById: req.user!.id,
        payload: JSON.stringify({ projectId: project.id, name: project.name })
      }
    });
    
    await prisma.auditLog.create({
      data: {
        action: 'PROJECT_SUBMITTED_FOR_APPROVAL',
        userId: req.user!.id,
        details: JSON.stringify({ recordId: project.id, name: project.name })
      }
    });
    
    res.json({ success: true, message: 'Project submitted for approval' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user!.role;
    let projects;

    if (role === 'MD' || role === 'AM') {
      projects = await prisma.project.findMany({ include: { units: true }, orderBy: { updatedAt: 'desc' } });
    } else {
      // Associate: Only see approved AND assigned projects
      projects = await prisma.project.findMany({
        where: {
          status: { in: ['APPROVED', 'PUBLISHED'] },
          assignments: { some: { userId: req.user!.id } }
        },
        include: { units: true },
        orderBy: { updatedAt: 'desc' }
      });
    }

    res.json({ success: true, projects });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id: id as string },
      include: { units: true, assignments: { include: { user: { select: { name: true, userId: true } } } } }
    });

    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, project });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addInventoryUnit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { identifier, unitNumber, block, size, sizeUnit, price, basePrice, offerPrice, facing, isCorner, isParkFacing, isRoadFacing, premiumCharges } = req.body;

    const unit = await prisma.inventoryUnit.create({
      data: {
        projectId: id as string,
        identifier,
        unitNumber,
        block,
        size,
        sizeUnit,
        price,
        basePrice,
        offerPrice,
        facing,
        isCorner: isCorner === true || isCorner === 'true',
        isParkFacing: isParkFacing === true || isParkFacing === 'true',
        isRoadFacing: isRoadFacing === true || isRoadFacing === 'true',
        premiumCharges
      }
    });

    res.json({ success: true, unit });
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Duplicate unit identifier in this project.' });
    res.status(500).json({ error: error.message });
  }
};

export const updateInventoryUnit = async (req: AuthRequest, res: Response) => {
  try {
    const { unitId } = req.params;
    const body = req.body;
    
    const data: any = {};
    if (body.identifier !== undefined) data.identifier = body.identifier;
    if (body.unitNumber !== undefined) data.unitNumber = body.unitNumber;
    if (body.block !== undefined) data.block = body.block;
    if (body.size !== undefined) data.size = body.size;
    if (body.sizeUnit !== undefined) data.sizeUnit = body.sizeUnit;
    if (body.price !== undefined) data.price = body.price;
    if (body.basePrice !== undefined) data.basePrice = body.basePrice;
    if (body.offerPrice !== undefined) data.offerPrice = body.offerPrice;
    if (body.facing !== undefined) data.facing = body.facing;
    if (body.status !== undefined) data.status = body.status;
    if (body.isCorner !== undefined) data.isCorner = body.isCorner === true || body.isCorner === 'true';
    if (body.isParkFacing !== undefined) data.isParkFacing = body.isParkFacing === true || body.isParkFacing === 'true';
    if (body.isRoadFacing !== undefined) data.isRoadFacing = body.isRoadFacing === true || body.isRoadFacing === 'true';
    if (body.premiumCharges !== undefined) data.premiumCharges = body.premiumCharges;
    
    const unit = await prisma.inventoryUnit.update({
      where: { id: unitId as string },
      data
    });
    
    res.json({ success: true, unit });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteInventoryUnit = async (req: AuthRequest, res: Response) => {
  try {
    const { unitId } = req.params;
    await prisma.inventoryUnit.delete({ where: { id: unitId as string } });
    res.json({ success: true, message: 'Unit deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const assignProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const assignment = await prisma.projectAssignment.create({
      data: { projectId: id as string, userId }
    });

    res.json({ success: true, assignment });
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Already assigned' });
    res.status(500).json({ error: error.message });
  }
};
