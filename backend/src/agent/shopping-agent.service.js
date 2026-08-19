import { getGeminiClient, isGeminiConfigured } from '../services/gemini.service.js';
import { shoppingToolDefinitions } from './tool-definitions.js';
import { executeShoppingTool } from './tools/tool-registry.js';

export const SHOPPING_AGENT_SYSTEM_INSTRUCTION = `You are ShopPilot, the friendly AI Shopping Assistant for AgentShop AI.
You are not a generic chatbot. Help shoppers search the live catalog, understand purchases, track orders, and take safe shopping actions.
You cannot access MongoDB, files, or internal services directly. The only way to get current catalog or account data is to call a provided backend tool.
Always call a tool for product, price, stock, order, purchase-history, insight, or cart questions. Never invent products, prices, stock, order details, or successful actions.
When the shopper asks to empty, clear, or remove everything from the cart, call clearCart. When they name one product, use removeFromCart.
If a protected tool says the shopper must sign in, explain that clearly and do not claim the action happened.
Use the shopper's language (Bangla, Banglish, or English). Be concise, clear, and complete.

CRITICAL LIVE VOICE & TOOL RULES:
- DO NOT narrate, think out loud, or say introductory filler before calling a tool (NEVER say "Initiating product search...", "I am formulating the search query...", "I will execute searchByBudget...", "বাজেট অনুযায়ী ফোন খুঁজছেন 🎉 ঠিক আছে! আমি আপনার জন্য দেখছি").
- Invoke the tool SILENTLY.
- When the tool returns products, IMMEDIATELY speak out the complete list of products with their exact names and prices in BDT (৳) in natural spoken Bangla/English.
- Example spoken response in Bangla: "৫০,০০০ টাকার বাজেটের মধ্যে আমাদের কাছে এই ফোনগুলো রয়েছে: ১. স্যামসাং গ্যালাক্সি A55 — ৳৪২,৯০০, ২. ওয়ানপ্লাস নর্ড CE 4 — ৳৩২,৯০০, ৩. রিয়েলমি 12 Pro — ৳২৯,৯০০, এবং ৪. শাওমি রেডমি নোট 13 — ৳২৪,৯০০।"

IMPORTANT — avoid loops and empty replies:
- After you receive tool results, ALWAYS produce a final spoken/text reply summarizing ALL the matching products with their prices.
- If a tool returns zero products, explain politely that no products match that exact filter and mention available alternatives or prices.
- Never stop after an introductory sentence without providing the actual product details.

Formatting rules for text replies:
- Use a friendly, warm tone with matching emojis (🛍️ for shopping, 💰 for prices, 🔍 for searching, 🎉 for confirmations).
- Wrap product names and prices in **double asterisks** so they render bold (e.g. **Samsung Galaxy A55** — **৳42,900**).
- Use short paragraphs and bullet points for multiple items.`;

function responseParts(response) {
  return response?.candidates?.[0]?.content?.parts || [];
}

function responseText(response) {
  const text = typeof response?.text === 'function' ? response.text() : response?.text;
  return text?.trim() || responseParts(response).filter((part) => part.text).map((part) => part.text).join('\n').trim() || '';
}

function collectProducts(toolResults) {
  const products = [];
  const seen = new Set();
  for (const result of toolResults) {
    const candidates = [
      ...(Array.isArray(result?.products) ? result.products : []),
      ...(Array.isArray(result?.alternatives) ? result.alternatives : []),
      ...(Array.isArray(result?.inventory) ? result.inventory : []),
      ...(result?.product ? [result.product] : []),
    ];
    for (const product of candidates) {
      if (!product?.id || seen.has(product.id)) continue;
      seen.add(product.id);
      products.push(product);
    }
  }
  return products;
}

function compactHistory(history = []) {
  return history.slice(-8).flatMap((item) => {
    if (!item?.content) return [];
    return [{ role: item.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(item.content).slice(0, 2000) }] }];
  });
}

export async function runShoppingAgent({ message, history = [], user }) {
  if (!isGeminiConfigured()) {
    return { message: 'Gemini is not configured yet. Add GEMINI_API_KEY to the backend environment.', products: [], agent: { mode: 'unavailable', toolCalls: [] } };
  }

  const ai = getGeminiClient();
  const contents = [...compactHistory(history), { role: 'user', parts: [{ text: message }] }];
  const toolCalls = [];
  const toolResults = [];
  let finalText = '';
  let lastError = null;

  for (let turn = 0; turn < 6; turn += 1) {
    try {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: SHOPPING_AGENT_SYSTEM_INSTRUCTION,
          temperature: 0.2,
          tools: [{ functionDeclarations: shoppingToolDefinitions }],
          toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
        },
      });

      const parts = responseParts(response);
      const calls = parts.filter((part) => part.functionCall).map((part) => part.functionCall);

      if (!calls.length) {
        finalText = responseText(response);
        break;
      }

      // Keep thoughtSignature intact — Gemini SDK requires it for tool round-trips.
      contents.push({ role: 'model', parts });

      const functionResponses = [];
      for (const call of calls) {
        const args = call.args || {};
        let result;
        try {
          result = await executeShoppingTool(call.name, args, { user });
        } catch (toolError) {
          console.error(`Shopping tool ${call.name} failed: ${toolError.message}`);
          result = { ok: false, error: toolError.message, message: `${call.name} could not run right now.` };
        }
        toolCalls.push({ name: call.name, args });
        toolResults.push(result);
        functionResponses.push({ functionResponse: { name: call.name, response: result } });
      }

      // Detect a stuck loop (same call repeated) and break out.
      if (toolCalls.length >= 2) {
        const last = toolCalls[toolCalls.length - 1];
        const prev = toolCalls[toolCalls.length - 2];
        if (last.name === prev.name && JSON.stringify(last.args) === JSON.stringify(prev.args)) {
          console.warn(`[agent] stuck loop detected on ${last.name}; breaking.`);
          break;
        }
      }
      contents.push({ role: 'user', parts: functionResponses });
    } catch (requestError) {
      lastError = requestError;
      console.error(`Shopping agent Gemini call failed: ${requestError.message}`);
      break;
    }
  }

  const products = collectProducts(toolResults);
  let fallback;
  if (lastError) {
    fallback = 'I could not reach the shopping service just now. Please try again in a moment.';
  } else if (finalText) {
    fallback = finalText;
  } else if (products.length === 0) {
    fallback = '🔍 I checked our live catalog and could not find any matching products right now. Try a different search term, price range, or category.';
  } else {
    fallback = `🛍️ Here ${products.length === 1 ? 'is' : 'are'} ${products.length} ${products.length === 1 ? 'product' : 'products'} from our catalog that match your request.`;
  }
  return {
    message: finalText || fallback,
    products,
    agent: { mode: 'gemini-tools', toolCalls, error: lastError?.message || null },
  };
}
