import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Do NOT set a default Content-Type header. Doing so forces every request to
// `application/json`, which breaks FormData uploads: axios will send the
// multipart body but with an `application/json` header, and the backend
// `express.json()` middleware will throw a SyntaxError before multer runs.
// Letting axios auto-detect per-request (it picks `multipart/form-data; boundary=...`
// when given a FormData instance) keeps both JSON and multipart working.
api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('nova_access_token') || window.localStorage.getItem('shoppilot_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
