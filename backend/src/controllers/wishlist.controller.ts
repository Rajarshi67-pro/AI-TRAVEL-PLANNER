import { Request, Response } from 'express';
import prisma from '../config/prisma';

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const getWishlists = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const wishlists = await prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ wishlists });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, destination, notes } = req.body as { name: string; destination: string; notes?: string };

    if (!name || !destination) {
      return res.status(400).json({ message: 'Name and destination are required' });
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        name,
        destination,
        notes,
        userId,
      },
    });

    return res.status(201).json({ message: 'Wishlist item created', wishlist });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const wishlist = await prisma.wishlist.findUnique({ where: { id } });
    if (!wishlist || wishlist.userId !== userId) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    await prisma.wishlist.delete({ where: { id } });

    return res.status(200).json({ message: 'Wishlist item deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
