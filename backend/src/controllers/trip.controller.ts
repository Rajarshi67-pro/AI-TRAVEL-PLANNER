import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { generateTripItinerary } from '../services/ai.service';
import { getDestinationImage } from '../services/image.service';

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const createTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { title, destination, startDate, endDate, budget } = req.body as {
      title: string;
      destination: string;
      startDate: string;
      endDate: string;
      budget: string;
    };
    const userId = req.user!.userId;

    if (!title || !destination || !startDate || !endDate || !budget) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    // Fetch user preferences for context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });
    
    // Generate AI Itinerary
    const itinerary = await generateTripItinerary(destination, days, budget.toString(), user?.preferences || '');
    
    // Fetch image
    const imageUrl = await getDestinationImage(destination);

    const trip = await prisma.trip.create({
      data: {
        title,
        destination,
        startDate: start,
        endDate: end,
        budget: parseFloat(budget),
        userId,
      },
    });
    
    // Auto-create a journal for this trip
    await prisma.journal.create({
      data: {
        userId,
        tripId: trip.id,
        title: `Itinerary for ${destination}`,
        content: `![${destination}](${imageUrl})\n\n${itinerary}`,
      }
    });

    return res.status(201).json({ message: 'Trip created successfully', trip, itinerary, imageUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getTrips = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const trips = await prisma.trip.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { journals: true },
    });
    return res.status(200).json({ trips });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
