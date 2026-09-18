import { Response } from 'express';
import { Visit } from '../models/Visit';
import { Property } from '../models/Property';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

export const getVisits = async (req: AuthRequest, res: Response): Promise<void> => {
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
      filter = {};
    }

    const visits = await Visit.find(filter)
      .populate('tenant', 'name email phone avatar')
      .populate('ownerAgent', 'name email phone avatar')
      .populate('property', 'title rent city address images')
      .sort({ requestedDate: 1 });

    res.status(200).json({
      success: true,
      count: visits.length,
      visits,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error fetching visits' });
  }
};

export const scheduleVisit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const { propertyId, requestedDate, requestedTime, message } = req.body;

    const rawDate = requestedDate || req.body.visitDate;
    const rawTime = requestedTime || req.body.timeSlot;

    if (!propertyId || !rawDate || !rawTime) {
      res.status(400).json({ error: 'ValidationError', message: 'Property, date, and time slot are required' });
      return;
    }

    const visitDate = new Date(rawDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (visitDate < today) {
      res.status(400).json({ error: 'ValidationError', message: 'Cannot schedule visits in the past' });
      return;
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({ error: 'NotFound', message: 'Property not found' });
      return;
    }

    const visit = await Visit.create({
      tenant: req.user._id,
      property: property._id,
      ownerAgent: property.owner,
      requestedDate: visitDate,
      requestedTime: rawTime,
      message: message || req.body.notes || '',
      status: 'PENDING',
    });

    // Notify property owner
    await Notification.create({
      recipient: property.owner,
      type: 'VISIT',
      title: 'New Visit Request',
      message: `${req.user.name} requested an in-person tour of "${property.title}" for ${visitDate.toDateString()} at ${rawTime}`,
      relatedEntity: {
        entityType: 'Visit',
        id: visit._id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Visit scheduled successfully',
      visit,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error scheduling visit' });
  }
};

export const updateVisitStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { status, rescheduleReason } = req.body;

    const visit = await Visit.findById(id);
    if (!visit) {
      res.status(404).json({ error: 'NotFound', message: 'Visit not found' });
      return;
    }

    // Owner, agent, tenant, or admin can update their respective statuses
    const isOwner = visit.ownerAgent.toString() === req.user._id.toString();
    const isTenant = visit.tenant.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isTenant && !isAdmin) {
      res.status(403).json({ error: 'Forbidden', message: 'Not authorized to modify this visit' });
      return;
    }

    if (status) visit.status = status;
    if (rescheduleReason) visit.rescheduleReason = rescheduleReason;

    await visit.save();

    // Determine notification recipient
    const recipient = isOwner ? visit.tenant : visit.ownerAgent;
    await Notification.create({
      recipient,
      type: 'VISIT',
      title: `Visit Request ${visit.status}`,
      message: `Your visit scheduled for ${new Date(visit.requestedDate).toDateString()} is now ${visit.status}.${rescheduleReason ? ` Reason: ${rescheduleReason}` : ''}`,
      relatedEntity: {
        entityType: 'Visit',
        id: visit._id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Visit updated successfully',
      visit,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error updating visit' });
  }
};
