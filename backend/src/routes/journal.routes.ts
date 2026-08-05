import { Router } from 'express';
import { getJournals, getJournal } from '../controllers/journal.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, getJournals);
router.get('/:id', authenticateJWT, getJournal);

export default router;
