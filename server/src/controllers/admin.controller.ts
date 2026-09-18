import { Response } from 'express';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Enquiry } from '../models/Enquiry';
import { Visit } from '../models/Visit';
import { Report } from '../models/Report';
import { AuthRequest } from '../middleware/auth';

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalProperties, activeListings, pendingVerification, totalVisits, totalEnquiries] =
      await Promise.all([
        User.countDocuments(),
        Property.countDocuments(),
        Property.countDocuments({ listingStatus: 'ACTIVE' }),
        Property.countDocuments({ verificationStatus: 'PENDING' }),
        Visit.countDocuments(),
        Enquiry.countDocuments(),
      ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProperties,
        activeListings,
        pendingVerification,
        totalVisits,
        totalEnquiries,
        usersByRole,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error fetching stats' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, status } = req.query;
    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.accountStatus = status;

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error fetching users' });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { accountStatus, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: 'NotFound', message: 'User not found' });
      return;
    }

    // Protect current administrator from self-suspension
    if (req.user && req.user._id.toString() === id && accountStatus === 'SUSPENDED') {
      res.status(400).json({ error: 'ValidationError', message: 'Administrators cannot suspend their own account' });
      return;
    }

    if (accountStatus) user.accountStatus = accountStatus;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: `User account ${accountStatus ? accountStatus.toLowerCase() : 'updated'} successfully`,
      user,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error updating user' });
  }
};

export const getAdminProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { verificationStatus, listingStatus } = req.query;
    const filter: any = {};
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (listingStatus) filter.listingStatus = listingStatus;

    const properties = await Property.find(filter)
      .populate('owner', 'name email phone avatar role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error fetching properties' });
  }
};

export const verifyProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' | 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'ValidationError', message: 'Status must be APPROVED or REJECTED' });
      return;
    }

    const property = await Property.findByIdAndUpdate(
      id,
      { verificationStatus: status },
      { new: true }
    );

    if (!property) {
      res.status(404).json({ error: 'NotFound', message: 'Property not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Property ${status.toLowerCase()} successfully`,
      property,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error verifying property' });
  }
};

export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error fetching reports' });
  }
};

export const deleteAdminProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await Property.findByIdAndDelete(id);

    if (!property) {
      res.status(404).json({ error: 'NotFound', message: 'Property listing not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Property listing permanently removed by administrator',
      propertyId: id,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error removing property' });
  }
};
