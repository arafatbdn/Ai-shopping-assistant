import api from '../../../shared/api/client.js';

export async function loginUser(credentials) {
  const { data } = await api.post('/auth/login', credentials);
  return data;
}

export async function registerUser(credentials) {
  const { data } = await api.post('/auth/register', credentials);
  return data;
}
