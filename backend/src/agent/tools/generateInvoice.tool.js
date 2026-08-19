import Order from '../../models/Order.js';
import { requiresAuth, orderSummary, productSummary, validId } from './tool-utils.js';

export async function generateInvoice(user, args = {}) {
  if (!user) return requiresAuth();
  const order = args.orderId && validId(args.orderId)
    ? await Order.findOne({ _id: args.orderId, user: user._id }).populate('items.product', 'name brand images')
    : await Order.findOne({ user: user._id }).sort({ createdAt: -1 }).populate('items.product', 'name brand images');
  if (!order) return { ok: false, message: 'No order was found for invoice generation.' };
  return { ok: true, invoice: { invoiceNumber: `NOVA-${String(order._id).slice(-8).toUpperCase()}`, order: orderSummary(order), customer: { name: user.name, email: user.email }, items: order.items.map((item) => ({ ...productSummary(item.product || { name: item.name }), name: item.name, quantity: item.quantity, unitPrice: item.price, total: item.price * item.quantity })), subtotal: order.subtotal, discount: order.discount, total: order.total, generatedAt: new Date().toISOString() } };
}
