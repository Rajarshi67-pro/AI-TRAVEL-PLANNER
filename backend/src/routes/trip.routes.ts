import { Router } from 'express';
import { createTrip, getTrips } from '../controllers/trip.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Protect all trip routes
router.use(authenticateJWT);

router.post('/', createTrip);
router.get('/', getTrips);

export default router;
