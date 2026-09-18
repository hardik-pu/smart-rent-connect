import { Router } from 'express';
import {
  getProperties,
  getNearbyProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
} from '../controllers/property.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getProperties);
router.get('/nearby', getNearbyProperties);
router.get('/my/listings', protect, authorize('OWNER', 'AGENT', 'ADMIN'), getMyProperties);
router.get('/:id', getPropertyById);

// Protected routes (Owner / Agent / Admin)
router.post('/', protect, authorize('OWNER', 'AGENT', 'ADMIN'), createProperty);
router.put('/:id', protect, authorize('OWNER', 'AGENT', 'ADMIN'), updateProperty);
router.delete('/:id', protect, authorize('OWNER', 'AGENT', 'ADMIN'), deleteProperty);

export default router;
