import { Response } from 'express';
import { Favourite } from '../models/Favourite';
import { AuthRequest } from '../middleware/auth';

export const getFavourites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const favourites = await Favourite.find({ user: req.user._id })
      .populate({
        path: 'property',
        populate: { path: 'owner', select: 'name email phone avatar' },
      })
      .sort({ createdAt: -1 });

    // Filter out any properties that might have been deleted
    const validFavourites = favourites.filter((f) => f.property !== null);

    res.status(200).json({
      success: true,
      count: validFavourites.length,
      favourites: validFavourites,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error fetching favourites' });
  }
};

export const addFavourite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const { propertyId } = req.body;
    if (!propertyId) {
      res.status(400).json({ error: 'ValidationError', message: 'propertyId is required' });
      return;
    }

    // Check if already in favourites
    const existing = await Favourite.findOne({ user: req.user._id, property: propertyId });
    if (existing) {
      res.status(200).json({
        success: true,
        message: 'Property is already in your favourites',
        favourite: existing,
      });
      return;
    }

    const favourite = await Favourite.create({
      user: req.user._id,
      property: propertyId,
    });

    res.status(201).json({
      success: true,
      message: 'Property added to favourites',
      favourite,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error adding favourite' });
  }
};

export const removeFavourite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const { propertyId } = req.params;
    await Favourite.findOneAndDelete({ user: req.user._id, property: propertyId });

    res.status(200).json({
      success: true,
      message: 'Property removed from favourites',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error removing favourite' });
  }
};
