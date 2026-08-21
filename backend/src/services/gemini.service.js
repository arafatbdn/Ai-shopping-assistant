import { GoogleGenAI } from '@google/genai';

let client;

export function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export const LIVE_MODEL_ID = process.env.LIVE_MODEL || 'gemini-2.5-flash-native-audio-preview-12-2025';
export const LIVE_VOICE_NAME = process.env.LIVE_VOICE || 'Kore';

const EPHEMERAL_TOKEN_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/auth_tokens';

/**
 * Mint a short-lived token for the Gemini Live API (client-to-server pattern).
 * The token is locked to a model + setup payload, single-use, and valid for ~10 minutes.
 * Docs: https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens
 *
 * @param {object} [options]
 * @param {string} [options.sessionExpireMinutes=10]  How long the Live session may stay open (max ~20h).
 * @param {string} [options.newSessionExpireSeconds=60] Window in which the client must start the session.
 * @returns {Promise<{ token: string, expiresAt: string, newSessionExpireAt: string, model: string, voice: string }>}
 */
export async function mintLiveToken({
  sessionExpireMinutes = 10,
  newSessionExpireSeconds = 60,
} = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const now = Date.now();
  const expireTime = new Date(now + sessionExpireMinutes * 60_000).toISOString();
  const newSessionExpireTime = new Date(now + newSessionExpireSeconds * 1000).toISOString();

  // Per Gemini Live API docs: omit `bidiGenerateContentSetup` to leave the
  // LiveConnectConfig unlocked. The client then sends the full setup message
  // (model, voice, tools, systemInstruction, transcription, AAD) on `ws.onopen`.
  // Locking it on the token + also sending setup from the client causes the
  // server to reject/ignore the client setup and the model never produces output.
  const body = {
    expireTime,
    newSessionExpireTime,
    uses: 1,
  };

  const response = await fetch(EPHEMERAL_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Ephemeral token request failed (${response.status}): ${detail || response.statusText}`);
  }

  const payload = await response.json();
  const token = payload?.name || payload?.token;
  if (!token) throw new Error('Gemini did not return a token in the response');

  return {
    token,
    model: LIVE_MODEL_ID,
    voice: LIVE_VOICE_NAME,
    expiresAt: expireTime,
    newSessionExpireAt: newSessionExpireTime,
  };
}

export async function generateGeminiText({ systemInstruction, prompt }) {
  const ai = getGeminiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.35,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    const text = typeof response.text === 'function' ? response.text() : response.text;
    return text?.trim() || null;
  } catch (error) {
    console.error(`Gemini request failed: ${error.message}`);
    return null;
  }
}
