import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

export const generateTripItinerary = async (destination: string, days: number, budget: string): Promise<string> => {
  if (!apiKey) {
    return `# ${destination} - ${days} Day Itinerary\n\n*AI generation unavailable — add your GEMINI_API_KEY to backend/.env*\n\nThis is a placeholder itinerary. Please configure your API key for full AI-powered generation.`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert AI Travel Planner. Generate a beautiful, detailed day-by-day itinerary for a ${days}-day trip to ${destination} with a budget of $${budget} USD.

For each day include:
- Morning, afternoon, and evening activities with specific place names
- Breakfast, lunch, and dinner restaurant recommendations with price ranges
- Transportation tips between locations
- Estimated costs for key activities
- Pro travel tips and hidden gems

Format with clear headings like "Day 1: Arrival & Exploration". Use markdown formatting with emojis to make it engaging.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    console.error('AI generation error:', error.message);
    return `# ${destination} - ${days} Day Itinerary\n\n*Could not generate itinerary: ${error.message}*`;
  }
};
