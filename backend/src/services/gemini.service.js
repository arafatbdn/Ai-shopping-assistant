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
      },
    });

    const text = typeof response.text === 'function' ? response.text() : response.text;
    return text?.trim() || null;
  } catch (error) {
    console.error(`Gemini request failed: ${error.message}`);
    return null;
  }
}
