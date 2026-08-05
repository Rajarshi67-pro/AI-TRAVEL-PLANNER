import { Request, Response } from 'express';
import prisma from '../config/prisma';

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const getJournals = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const journals = await prisma.journal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { trip: true },
    });
    return res.status(200).json({ journals });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getJournal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const journal = await prisma.journal.findUnique({
      where: { id },
      include: { trip: true },
    });

    if (!journal || journal.userId !== userId) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    return res.status(200).json({ journal });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
