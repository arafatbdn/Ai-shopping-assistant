import Cart from '../../models/Cart.js';
import { requiresAuth, cartSummary, productSummary } from './tool-utils.js';

export async function getCart(user) {
  if (!user) return requiresAuth();
  const cart = await Cart.findOne({ user: user._id }).populate('items.product', 'name brand price originalPrice images stock rating');
  const summary = cartSummary(cart);
  const products = (cart?.items || [])
    .filter((item) => item.product)
    .map((item) => productSummary(item.product, { quantity: item.quantity, lineTotal: (item.product?.price || 0) * item.quantity }));

  if (!products.length) {
    return {
      ok: true,
      found: false,
      itemCount: 0,
      subtotal: 0,
      message: 'Your cart is currently empty.',
      products: [],
    };
  }

  return {
    ok: true,
    found: true,
    itemCount: products.length,
    totalQuantity: (cart?.items || []).reduce((sum, item) => sum + item.quantity, 0),
    subtotal: summary.subtotal,
    cart: summary,
    products,
    message: `You have ${products.length} item(s) in your cart totaling ৳${summary.subtotal.toLocaleString('en-BD')}.`,
  };
}
