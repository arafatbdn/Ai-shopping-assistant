import { mintLiveToken, isGeminiConfigured } from '../services/gemini.service.js';
import { SHOPPING_AGENT_SYSTEM_INSTRUCTION } from '../agent/shopping-agent.service.js';
import { shoppingToolDefinitions } from '../agent/tool-definitions.js';

/**
 * POST /api/live/token
 * Mints a short-lived Gemini Live API token bound to the ShopPilot system
 * instruction and tool set. The browser opens a WebSocket directly to Google
 * using this token, so the permanent API key never leaves the backend.
 */
export async function mintLiveSessionToken(_request, response) {
  if (!isGeminiConfigured()) {
    return response.status(503).json({ message: 'Gemini is not configured on the server' });
  }

  try {
    const token = await mintLiveToken();
    return response.json({
      token: token.token,
      model: token.model,
      voice: token.voice,
      expiresAt: token.expiresAt,
      newSessionExpireAt: token.newSessionExpireAt,
      systemInstruction: SHOPPING_AGENT_SYSTEM_INSTRUCTION,
      tools: shoppingToolDefinitions,
    });
  } catch (error) {
    console.error(`Live token mint failed: ${error.message}`);
    return response.status(502).json({ message: 'Could not start a voice session', detail: error.message });
  }
}