import { Router } from 'express';
import { getEnquiries, sendEnquiry, updateEnquiryStatus } from '../controllers/enquiry.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getEnquiries);
router.post('/', sendEnquiry);
router.patch('/:id/status', updateEnquiryStatus);
router.put('/:id/status', updateEnquiryStatus);

export default router;
