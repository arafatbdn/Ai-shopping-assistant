import Cart from '../../models/Cart.js';
import Coupon from '../../models/Coupon.js';
import { requiresAuth, cartSummary } from './tool-utils.js';

function discountFor(coupon, subtotal) {
  if (coupon.discountType === 'fixed') return Math.min(coupon.value, subtotal);
  const discount = subtotal * coupon.value / 100;
  return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
}

export async function applyBestCoupon(user) {
  if (!user) return requiresAuth();
  const cart = await Cart.findOne({ user: user._id }).populate('items.product', 'name brand price originalPrice images stock rating');
  const subtotal = cartSummary(cart).subtotal;
  const now = new Date();
  const coupons = await Coupon.find({ active: true, expiresAt: { $gt: now }, minimumOrder: { $lte: subtotal }, $or: [{ usageLimit: { $exists: false } }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }] }).lean();
  const best = coupons.map((coupon) => ({ coupon, discount: discountFor(coupon, subtotal) })).sort((a, b) => b.discount - a.discount)[0];
  if (!best) return { ok: true, found: false, subtotal, message: 'No active coupon currently applies to this cart.' };
  return { ok: true, found: true, coupon: { code: best.coupon.code, discountType: best.coupon.discountType, value: best.coupon.value }, subtotal, discount: best.discount, payable: subtotal - best.discount };
}
