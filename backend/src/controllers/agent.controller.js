import mongoose from 'mongoose';
import { runShoppingAgent } from '../agent/shopping-agent.service.js';

export async function runAgent(request, response) {
  try {
    if (mongoose.connection.readyState !== 1) return response.status(503).json({ message: 'Connect MongoDB to use the shopping agent' });
    const { message, history } = request.body;
    if (!message?.trim()) return response.status(400).json({ message: 'Tell ShopPilot what you want to shop for' });
    const result = await runShoppingAgent({ message: message.trim(), history, user: request.user });
    return response.json(result);
  } catch (error) {
    console.error(`Shopping agent failed: ${error.message}`);
    const detail = error.message || '';
    if (detail.includes('429') || detail.includes('RESOURCE_EXHAUSTED') || detail.includes('quota')) {
      return response.status(429).json({ message: 'ShopPilot is temporarily unavailable because the Gemini usage limit has been reached. Please try again after the quota resets.', code: 'GEMINI_QUOTA_EXCEEDED' });
    }
    return response.status(500).json({ message: 'ShopPilot could not complete that shopping task', detail });
  }
}
