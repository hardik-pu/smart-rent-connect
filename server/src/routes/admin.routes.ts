import { Router } from 'express';
import {
  getStats,
  getUsers,
  updateUserStatus,
  getAdminProperties,
  verifyProperty,
  deleteAdminProperty,
  getReports,
} from '../controllers/admin.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect, authorize('ADMIN'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id', updateUserStatus);
router.get('/properties', getAdminProperties);
router.patch('/properties/:id/verify', verifyProperty);
router.delete('/properties/:id', deleteAdminProperty);
router.get('/reports', getReports);

export default router;
