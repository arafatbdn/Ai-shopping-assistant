import api from '../../../shared/api/client.js';

export async function fetchCart() {
  const { data } = await api.get('/cart');
  return data.cart;
}

export async function addCartItem(productId, quantity = 1) {
  const { data } = await api.post('/cart/items', { productId, quantity });
  return data.cart;
}

export async function removeCartItem(productId) {
  const { data } = await api.delete(`/cart/items/${productId}`);
  return data.cart;
}

export async function updateCartItem(productId, quantity) {
  const { data } = await api.patch(`/cart/items/${productId}`, { quantity });
  return data.cart;
}
