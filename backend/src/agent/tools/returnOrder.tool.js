import Order from '../../models/Order.js';
import { requiresAuth, orderSummary } from './tool-utils.js';

export async function returnOrder(user, args = {}) {
  if (!user) return requiresAuth();
  const order = args.orderId ? await Order.findOne({ _id: args.orderId, user: user._id }) : await Order.findOne({ user: user._id }).sort({ createdAt: -1 });
  if (!order) return { ok: false, message: 'No order was found to return.' };
  if (!['delivered', 'shipped'].includes(order.status)) return { ok: false, message: `This order is ${order.status}; it is not eligible for a return yet.` };
  order.status = 'returned';
  await order.save();
  return { ok: true, action: 'returnOrder', message: 'Your return request was recorded.', reason: args.reason || null, order: orderSummary(order) };
}
