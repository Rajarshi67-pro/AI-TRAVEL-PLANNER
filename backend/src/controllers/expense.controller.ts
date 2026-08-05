import { Request, Response } from 'express';
import prisma from '../config/prisma';

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = req.params;
    const userId = req.user!.userId;

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.userId !== userId) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const expenses = await prisma.expense.findMany({
      where: { tripId },
      orderBy: { date: 'desc' },
    });

    return res.status(200).json({ expenses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const addExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = req.params;
    const userId = req.user!.userId;
    const { amount, category, description, date } = req.body as {
      amount: number;
      category: string;
      description: string;
      date?: string;
    };

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.userId !== userId) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const expense = await prisma.expense.create({
      data: {
        amount,
        category,
        description,
        date: date ? new Date(date) : new Date(),
        tripId,
      },
    });

    return res.status(201).json({ message: 'Expense added', expense });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
