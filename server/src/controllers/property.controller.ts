import { Request, Response } from 'express';
import { Property, IProperty } from '../models/Property';
import { AuthRequest } from '../middleware/auth';

export const getProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      city,
      type,
      minRent,
      maxRent,
      bedrooms,
      bathrooms,
      amenities,
      available,
      sort,
      page = 1,
      limit = 24,
      owner,
    } = req.query;

    const query: any = {
      listingStatus: 'ACTIVE',
      verificationStatus: 'APPROVED',
    };

    // If querying specific owner listings (for owner view)
    if (owner) {
      delete query.listingStatus;
      delete query.verificationStatus;
      query.owner = owner;
    }

    // Availability
    if (available !== undefined && available !== '') {
      query.availability = available === 'true';
    }

    // Keyword search (title, description, city, address)
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { city: searchRegex },
        { address: searchRegex },
      ];
    }

    // City filter
    if (city && typeof city === 'string' && city.trim() !== '') {
      query.city = new RegExp(`^${city.trim()}$`, 'i');
    }

    // Property Type
    if (type && typeof type === 'string' && type.trim() !== '') {
      query.propertyType = type.trim();
    }

    // Rent Range
    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }

    // Bedrooms
    if (bedrooms && !isNaN(Number(bedrooms))) {
      query.bedrooms = { $gte: Number(bedrooms) };
    }

    // Bathrooms
    if (bathrooms && !isNaN(Number(bathrooms))) {
      query.bathrooms = { $gte: Number(bathrooms) };
    }

    // Amenities (comma separated or array)
    if (amenities) {
      const amenityList = Array.isArray(amenities)
        ? amenities
        : (amenities as string).split(',').map((a) => a.trim()).filter(Boolean);
      if (amenityList.length > 0) {
        query.amenities = { $all: amenityList };
      }
    }

    // Sorting
    let sortOption: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { rent: 1 };
    else if (sort === 'price_desc') sortOption = { rent: -1 };
    else if (sort === 'area_desc') sortOption = { area: -1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('owner', 'name email phone avatar role')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Property.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      properties,
    });
  } catch (err: any) {
    console.error('[Get Properties Error]', err);
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error fetching properties' });
  }
};

export const getNearbyProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      lat,
      lng,
      radius = 10,
      search,
      city,
      type,
      minRent,
      maxRent,
      bedrooms,
      amenities,
      available,
    } = req.query;

    if (!lat || !lng) {
      res.status(400).json({ error: 'ValidationError', message: 'Latitude (lat) and Longitude (lng) are required' });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusKm = parseFloat(radius as string) || 10;
    const maxDistanceMeters = radiusKm * 1000;

    const matchStage: any = {
      listingStatus: 'ACTIVE',
      verificationStatus: 'APPROVED',
    };

    if (city && typeof city === 'string') {
      matchStage.city = new RegExp(`^${city.trim()}$`, 'i');
    }

    if (type && typeof type === 'string') {
      matchStage.propertyType = type;
    }

    if (available !== undefined && available !== '') {
      matchStage.availability = available === 'true';
    }

    if (bedrooms && !isNaN(Number(bedrooms))) {
      matchStage.bedrooms = { $gte: Number(bedrooms) };
    }

    if (amenities) {
      const amenityList = Array.isArray(amenities)
        ? amenities
        : (amenities as string).split(',').map((a) => a.trim()).filter(Boolean);
      if (amenityList.length > 0) {
        matchStage.amenities = { $all: amenityList };
      }
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const s = new RegExp(search.trim(), 'i');
      matchStage.$or = [{ title: s }, { description: s }, { address: s }];
    }

    if (minRent || maxRent) {
      matchStage.rent = {};
      if (minRent) matchStage.rent.$gte = Number(minRent);
      if (maxRent) matchStage.rent.$lte = Number(maxRent);
    }

    // Geospatial aggregation with $geoNear
    const properties = await Property.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          distanceField: 'distanceMeters',
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: matchStage,
        },
      },
      {
        $addFields: {
          distanceKm: {
            $round: [{ $divide: ['$distanceMeters', 1000] }, 2],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'ownerDetails',
        },
      },
      {
        $unwind: {
          path: '$ownerDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          propertyType: 1,
          rent: 1,
          securityDeposit: 1,
          bedrooms: 1,
          bathrooms: 1,
          area: 1,
          amenities: 1,
          images: 1,
          address: 1,
          city: 1,
          state: 1,
          location: 1,
          distanceMeters: 1,
          distanceKm: 1,
          verificationStatus: 1,
          listingStatus: 1,
          createdAt: 1,
          owner: {
            _id: '$ownerDetails._id',
            name: '$ownerDetails.name',
            email: '$ownerDetails.email',
            phone: '$ownerDetails.phone',
            avatar: '$ownerDetails.avatar',
          },
        },
      },
      { $sort: { distanceKm: 1 } },
      { $limit: 30 },
    ]);

    res.status(200).json({
      success: true,
      center: { latitude, longitude },
      radiusKm,
      count: properties.length,
      properties,
    });
  } catch (err: any) {
    console.error('[Nearby Properties Error]', err);
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error executing location search' });
  }
};

export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const property = await Property.findByIdAndUpdate(
      id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).populate('owner', 'name email phone avatar role');

    if (!property) {
      res.status(404).json({ error: 'NotFound', message: 'Property listing not found' });
      return;
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error fetching property' });
  }
};

export const createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const {
      title,
      description,
      propertyType,
      rent,
      securityDeposit,
      bedrooms,
      bathrooms,
      area,
      amenities,
      images,
      address,
      city,
      state,
      country,
      coordinates, // [longitude, latitude]
    } = req.body;

    if (!title || !description || !propertyType || !rent || !address || !city) {
      res.status(400).json({ error: 'ValidationError', message: 'Missing mandatory property fields' });
      return;
    }

    const coords = coordinates && coordinates.length === 2
      ? coordinates
      : (req.body.longitude && req.body.latitude
          ? [Number(req.body.longitude), Number(req.body.latitude)]
          : [72.8777, 19.0760]); // default Mumbai coords

    const normType = (propertyType || 'apartment').toString().toLowerCase();

    const property = await Property.create({
      title,
      description,
      owner: req.user._id,
      propertyType: normType,
      rent: Number(rent),
      securityDeposit: Number(securityDeposit || rent),
      bedrooms: Number(bedrooms || 1),
      bathrooms: Number(bathrooms || 1),
      area: Number(area || 500),
      amenities: Array.isArray(amenities) ? amenities : [],
      images: Array.isArray(images) && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80'
      ],
      address,
      city,
      state: state || 'Maharashtra',
      country: country || 'India',
      location: {
        type: 'Point',
        coordinates: [Number(coords[0]), Number(coords[1])],
      },
      verificationStatus: req.user.role === 'ADMIN' ? 'APPROVED' : 'APPROVED', // auto-approve for seamless testing
      listingStatus: 'ACTIVE',
    });

    res.status(201).json({
      success: true,
      message: 'Property listed successfully',
      property,
    });
  } catch (err: any) {
    console.error('[Create Property Error]', err);
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error creating property' });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      res.status(404).json({ error: 'NotFound', message: 'Property not found' });
      return;
    }

    // Check ownership or admin
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden', message: 'You are not authorized to edit this property' });
      return;
    }

    const updates = req.body;
    if (updates.coordinates) {
      updates.location = {
        type: 'Point',
        coordinates: updates.coordinates,
      };
      delete updates.coordinates;
    }

    const updated = await Property.findByIdAndUpdate(id, updates, { new: true });

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      property: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error updating property' });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      res.status(404).json({ error: 'NotFound', message: 'Property not found' });
      return;
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden', message: 'You are not authorized to delete this property' });
      return;
    }

    await Property.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Property listing deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error deleting property' });
  }
};

export const getMyProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error fetching user properties' });
  }
};
