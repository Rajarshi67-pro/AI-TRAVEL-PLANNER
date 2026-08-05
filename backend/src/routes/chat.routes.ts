import { Router } from 'express';
import { chatStream, clearHistory } from '../controllers/chat.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/stream', authenticateJWT, chatStream);
router.delete('/history', authenticateJWT, clearHistory);

export default router;
