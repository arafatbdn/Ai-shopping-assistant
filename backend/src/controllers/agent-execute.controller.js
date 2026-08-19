import { executeShoppingTool } from '../agent/tools/tool-registry.js';

/**
 * POST /api/agent/execute
 * Used by the Gemini Live WebSocket client. When Gemini sends a `toolCall`,
 * the browser forwards each function call here and gets back a `response`
 * payload to send in the next `toolResponse` message.
 *
 * Body: { calls: [{ id: string, name: string, args?: object }, ...] }
 * Response: { responses: [{ id, name, response }, ...] }
 */
export async function executeAgentTools(request, response) {
  const calls = Array.isArray(request.body?.calls) ? request.body.calls : null;
  if (!calls) {
    return response.status(400).json({ message: 'calls array is required' });
  }

  const responses = [];
  for (const call of calls) {
    const id = String(call?.id || '').trim();
    const name = String(call?.name || '').trim();
    if (!id || !name) {
      responses.push({ id, name, response: { name, content: { ok: false, message: 'Missing tool call id or name' } } });
      continue;
    }
    try {
      const result = await executeShoppingTool(name, call.args || {}, { user: request.user || null });
      responses.push({
        id,
        name,
        response: {
          output: result,
          ...result,
        },
      });
    } catch (error) {
      console.error(`Live tool ${name} failed: ${error.message}`);
      responses.push({
        id,
        name,
        response: {
          output: { ok: false, message: error.message || 'Tool execution failed' },
          ok: false,
          message: error.message || 'Tool execution failed',
        },
      });
    }
  }

  return response.json({ responses });
}