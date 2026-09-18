import { Router } from 'express';
import { getVisits, scheduleVisit, updateVisitStatus } from '../controllers/visit.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getVisits);
router.post('/', scheduleVisit);
router.patch('/:id/status', updateVisitStatus);
router.put('/:id/status', updateVisitStatus);

export default router;
