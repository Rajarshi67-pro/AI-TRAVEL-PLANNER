import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

interface AuthRequest extends Request {
  user?: { userId: string };
}

// Per-user conversation history (in-memory; would be Redis/DB in production)
const userConversations: Record<string, Array<{ role: string; parts: Array<{ text: string }> }>> = {};

const SYSTEM_CONTEXT = `You are an expert AI Travel Assistant named Atlas. You help users plan trips, recommend destinations, suggest itineraries, provide budget advice, recommend restaurants, activities, hotels, and local experiences. You are friendly, enthusiastic, and highly knowledgeable about travel worldwide. Always give specific, actionable advice with real place names, estimated costs, and pro travel tips. Format your responses clearly using markdown.`;

export const chatStream = async (req: AuthRequest, res: Response) => {
  const { message } = req.body as { message: string };
  const userId = req.user?.userId || 'anonymous';

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured. Add it to backend/.env' });
  }

  try {
    // Initialize conversation history for this user
    if (!userConversations[userId]) {
      userConversations[userId] = [];
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: SYSTEM_CONTEXT,
    });

    const chat = model.startChat({
      history: userConversations[userId] as any,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    // Set SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.flushHeaders();

    const result = await chat.sendMessageStream(message);

    let fullResponse = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    // Persist history for follow-up questions
    userConversations[userId].push(
      { role: 'user', parts: [{ text: message }] },
      { role: 'model', parts: [{ text: fullResponse }] }
    );

    // Trim history to last 20 exchanges to save memory
    if (userConversations[userId].length > 40) {
      userConversations[userId] = userConversations[userId].slice(-40);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Chat stream error:', error.message);
    res.write(`data: ${JSON.stringify({ error: error.message || 'Failed to generate response' })}\n\n`);
    res.end();
  }
};

export const clearHistory = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId || 'anonymous';
  userConversations[userId] = [];
  return res.status(200).json({ message: 'Conversation history cleared' });
};
