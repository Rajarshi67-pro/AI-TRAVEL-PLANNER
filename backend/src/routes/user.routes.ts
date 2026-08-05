import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);

export default router;
