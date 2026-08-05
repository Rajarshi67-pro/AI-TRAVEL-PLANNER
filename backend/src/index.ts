import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import tripRoutes from './routes/trip.routes';
import chatRoutes from './routes/chat.routes';
import userRoutes from './routes/user.routes';
import wishlistRoutes from './routes/wishlist.routes';
import expenseRoutes from './routes/expense.routes';
import journalRoutes from './routes/journal.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ['http://localhost:3000', 'https://ai-travel-planner-dl0a.onrender.com'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/journals', journalRoutes);

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'AI Travel Planner API is running ✅' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
