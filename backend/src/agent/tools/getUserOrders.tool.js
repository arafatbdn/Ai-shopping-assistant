import Order from '../../models/Order.js';
import { requiresAuth, orderSummary } from './tool-utils.js';

export async function getUserOrders(user, args = {}) {
  if (!user) return requiresAuth();
  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(Math.min(Math.max(Number(args.limit) || 10, 1), 30)).lean();
  return { ok: true, count: orders.length, orders: orders.map(orderSummary) };
}
