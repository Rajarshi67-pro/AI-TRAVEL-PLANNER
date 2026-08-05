import { Router } from 'express';
import { getWishlists, createWishlist, deleteWishlist } from '../controllers/wishlist.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, getWishlists);
router.post('/', authenticateJWT, createWishlist);
router.delete('/:id', authenticateJWT, deleteWishlist);

export default router;
