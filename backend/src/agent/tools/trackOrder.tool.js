import Order from '../../models/Order.js';
import { requiresAuth, orderSummary, productSummary } from './tool-utils.js';

export async function trackOrder(user, args = {}) {
  if (!user) return requiresAuth();
  const order = args.orderId
    ? await Order.findOne({ _id: args.orderId, user: user._id }).populate('items.product', 'name brand price images stock rating').lean()
    : await Order.findOne({ user: user._id }).sort({ createdAt: -1 }).populate('items.product', 'name brand price images stock rating').lean();
  if (!order) return { ok: true, found: false, message: 'No matching order was found on this account.' };
  return { ok: true, found: true, order: orderSummary(order), products: order.items.map((item) => productSummary(item.product || { name: item.name, price: item.price }, { quantity: item.quantity, price: item.price })) };
}
