import Order from '../../models/Order.js';
import { requiresAuth, orderSummary } from './tool-utils.js';

export async function cancelOrder(user, args = {}) {
  if (!user) return requiresAuth();
  const order = args.orderId ? await Order.findOne({ _id: args.orderId, user: user._id }) : await Order.findOne({ user: user._id }).sort({ createdAt: -1 });
  if (!order) return { ok: false, message: 'No order was found to cancel.' };
  if (!['processing', 'confirmed'].includes(order.status)) return { ok: false, message: `This order is already ${order.status} and cannot be cancelled.` };
  order.status = 'cancelled';
  await order.save();
  return { ok: true, action: 'cancelOrder', message: 'Your order was cancelled successfully.', order: orderSummary(order) };
}
