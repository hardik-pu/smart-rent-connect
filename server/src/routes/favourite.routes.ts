import { Router } from 'express';
import { getFavourites, addFavourite, removeFavourite } from '../controllers/favourite.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getFavourites);
router.post('/', addFavourite);
router.delete('/:propertyId', removeFavourite);

export default router;
