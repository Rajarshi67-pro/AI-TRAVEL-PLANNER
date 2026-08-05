import { Router } from 'express';
import { getExpenses, addExpense } from '../controllers/expense.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:tripId', authenticateJWT, getExpenses);
router.post('/:tripId', authenticateJWT, addExpense);

export default router;
