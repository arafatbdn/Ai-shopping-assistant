import api from '../../../shared/api/client.js';

export async function fetchCategoryProducts(query) {
  const { data } = await api.get('/products', { params: { q: query, limit: 12 } });
  return data.products || [];
}
