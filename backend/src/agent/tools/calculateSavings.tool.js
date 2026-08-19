import Cart from '../../models/Cart.js';
import { requiresAuth, cartSummary } from './tool-utils.js';

export async function calculateSavings(user) {
  if (!user) return requiresAuth();
  const cart = await Cart.findOne({ user: user._id }).populate('items.product', 'name price originalPrice');
  const items = cart?.items || [];
  const originalTotal = items.reduce((sum, item) => sum + (item.product?.originalPrice || item.product?.price || 0) * item.quantity, 0);
  const currentTotal = cartSummary(cart).subtotal;
  return { ok: true, originalTotal, currentTotal, saved: Math.max(originalTotal - currentTotal, 0), savingsPercentage: originalTotal ? Math.round(((originalTotal - currentTotal) / originalTotal) * 100) : 0 };
}
