import api from '../../../shared/api/client.js';

export async function getAdminDashboard() {
  const { data } = await api.get('/admin/dashboard');
  return data;
}

export async function runFraudCheck(payload) {
  const { data } = await api.post('/admin/fraud-check', payload);
  return data;
}

export async function generateNotification(payload) {
  const { data } = await api.post('/admin/notifications', payload);
  return data;
}

export async function createAdminProduct(formData) {
  const { data } = await api.post('/admin/products', formData);
  return data;
}

export async function fetchAdminProducts() {
  const { data } = await api.get('/admin/products');
  return data;
}

export async function deleteAdminProduct(productId) {
  const { data } = await api.delete(`/admin/products/${productId}`);
  return data;
}
