import Cart from '../../models/Cart.js';
import { requiresAuth, cartSummary } from './tool-utils.js';

export async function clearCart(user) {
  if (!user) return requiresAuth();
  const cart = await Cart.findOneAndUpdate({ user: user._id }, { $set: { items: [] } }, { new: true }).populate('items.product', 'name brand price originalPrice images stock rating');
  return { ok: true, action: 'clearCart', message: 'All products were removed from your cart.', cart: cartSummary(cart) };
}
