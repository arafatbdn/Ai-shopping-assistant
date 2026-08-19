import api from '../../../shared/api/client.js';

export function sendAssistantMessage(message, history = []) {
  return api.post('/agent/chat', { message, history });
}
