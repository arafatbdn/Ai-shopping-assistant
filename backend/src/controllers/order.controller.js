import Order from '../models/Order.js';

export async function listOrders(request, response) {
  const orders = await Order.find({ user: request.user._id }).populate('items.product', 'name images brand').sort({ createdAt: -1 });
  response.json({ orders });
}

export async function getLatestOrder(request, response) {
  const order = await Order.findOne({ user: request.user._id }).populate('items.product', 'name images brand').sort({ createdAt: -1 });
  if (!order) return response.status(404).json({ message: 'No orders found for this account' });
  response.json({ order });
}

export async function cancelLatestOrder(request, response) {
  const order = await Order.findOne({ user: request.user._id }).sort({ createdAt: -1 });
  if (!order) return response.status(404).json({ message: 'No orders found for this account' });
  if (!['processing', 'confirmed'].includes(order.status)) return response.status(409).json({ message: `This order cannot be cancelled because it is already ${order.status}` });

  order.status = 'cancelled';
  await order.save();
  response.json({ message: 'Your latest order has been cancelled', order });
}
