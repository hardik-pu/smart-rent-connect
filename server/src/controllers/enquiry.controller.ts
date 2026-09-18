import { Response } from 'express';
import { Enquiry } from '../models/Enquiry';
import { Property } from '../models/Property';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

export const getEnquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    let filter: any = {};

    if (req.user.role === 'TENANT') {
      filter.tenant = req.user._id;
    } else if (req.user.role === 'OWNER' || req.user.role === 'AGENT') {
      filter.ownerAgent = req.user._id;
    } else if (req.user.role === 'ADMIN') {
      // Admin can see all
      filter = {};
    }

    const enquiries = await Enquiry.find(filter)
      .populate('tenant', 'name email phone avatar')
      .populate('ownerAgent', 'name email phone avatar')
      .populate('property', 'title rent city address images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error fetching enquiries' });
  }
};

export const sendEnquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const { propertyId, message, phone } = req.body;

    if (!propertyId || !message) {
      res.status(400).json({ error: 'ValidationError', message: 'propertyId and message are required' });
      return;
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({ error: 'NotFound', message: 'Property not found' });
      return;
    }

    const enquiry = await Enquiry.create({
      tenant: req.user._id,
      property: property._id,
      ownerAgent: property.owner,
      message,
      phone: phone || req.user.phone || '',
      status: 'PENDING',
    });

    // Create Notification for the property owner
    await Notification.create({
      recipient: property.owner,
      type: 'ENQUIRY',
      title: 'New Rental Enquiry Received',
      message: `${req.user.name} sent an enquiry for "${property.title}"`,
      relatedEntity: {
        entityType: 'Enquiry',
        id: enquiry._id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      enquiry,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error sending enquiry' });
  }
};

export const updateEnquiryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { status, reply } = req.body;

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      res.status(404).json({ error: 'NotFound', message: 'Enquiry not found' });
      return;
    }

    const isOwner = enquiry.ownerAgent.toString() === req.user._id.toString();
    const isTenant = enquiry.tenant.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isTenant && !isAdmin) {
      res.status(403).json({ error: 'Forbidden', message: 'Not authorized to modify this enquiry' });
      return;
    }

    const normalizedStatus = status === 'RESPONDED' ? 'CONTACTED' : status;
    const finalReply = reply !== undefined ? reply : req.body.responseMessage;

    if (normalizedStatus) enquiry.status = normalizedStatus;
    if (finalReply !== undefined && (isOwner || isAdmin)) enquiry.reply = finalReply;

    await enquiry.save();

    // Notify opposite party
    const recipient = isOwner ? enquiry.tenant : enquiry.ownerAgent;
    await Notification.create({
      recipient,
      type: 'ENQUIRY',
      title: 'Update on Rental Enquiry',
      message: `Enquiry for property is now "${enquiry.status}". ${reply ? `Note: "${reply}"` : ''}`,
      relatedEntity: {
        entityType: 'Enquiry',
        id: enquiry._id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully',
      enquiry,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error updating enquiry' });
  }
};
