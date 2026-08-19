import api from '../../../shared/api/client.js';

export async function fetchCategoryProducts(categoryOrOptions) {
  let params = { limit: 24 };
  if (typeof categoryOrOptions === 'string') {
    params.category = categoryOrOptions;
  } else if (categoryOrOptions && typeof categoryOrOptions === 'object') {
    params.category = categoryOrOptions.category || categoryOrOptions.name || categoryOrOptions.slug;
    if (categoryOrOptions.query) params.q = categoryOrOptions.query;
  }
  const { data } = await api.get('/products', { params });
  return data.products || [];
}
