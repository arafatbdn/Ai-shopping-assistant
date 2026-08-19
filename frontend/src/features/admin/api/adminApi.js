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
  // Strip any default Content-Type so axios lets the browser set the correct
  // `multipart/form-data; boundary=...` header for FormData payloads.
  const { data } = await api.post('/admin/products', formData, {
    headers: { 'Content-Type': undefined },
    transformRequest: (payload, headers) => {
      if (headers && typeof headers.delete === 'function') headers.delete('Content-Type');
      return payload;
    },
  });
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
