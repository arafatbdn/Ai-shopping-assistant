import Cart from '../../models/Cart.js';
import { requiresAuth, cartSummary } from './tool-utils.js';

export async function removeFromCart(user, args = {}) {
  if (!user) return requiresAuth();
  if (!args.productId) return { ok: false, message: 'Provide the product id to remove.' };
  const cart = await Cart.findOneAndUpdate({ user: user._id }, { $pull: { items: { product: args.productId } } }, { new: true }).populate('items.product', 'name brand price originalPrice images stock rating');
  return { ok: true, action: 'removeFromCart', message: 'The product was removed from your cart.', cart: cartSummary(cart) };
}
