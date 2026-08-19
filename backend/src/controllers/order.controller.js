import Order from '../models/Order.js';

export async function listOrders(request, response) {
  try {
    const orders = await Order.find({ user: request.user._id }).populate('items.product', 'name images brand').sort({ createdAt: -1 });
    return response.json({ orders });
  } catch (error) {
    console.error('listOrders error:', error.message);
    return response.status(500).json({ message: 'Unable to load orders', detail: error.message });
  }
}

export async function getLatestOrder(request, response) {
  try {
    const order = await Order.findOne({ user: request.user._id }).populate('items.product', 'name images brand').sort({ createdAt: -1 });
    if (!order) return response.status(404).json({ message: 'No orders found for this account' });
    return response.json({ order });
  } catch (error) {
    console.error('getLatestOrder error:', error.message);
    return response.status(500).json({ message: 'Unable to fetch latest order', detail: error.message });
  }
}

export async function cancelLatestOrder(request, response) {
  try {
    const order = await Order.findOne({ user: request.user._id }).sort({ createdAt: -1 });
    if (!order) return response.status(404).json({ message: 'No orders found for this account' });
    if (!['processing', 'confirmed'].includes(order.status)) return response.status(409).json({ message: `This order cannot be cancelled because it is already ${order.status}` });

    order.status = 'cancelled';
    await order.save();
    return response.json({ message: 'Your latest order has been cancelled', order });
  } catch (error) {
    console.error('cancelLatestOrder error:', error.message);
    return response.status(500).json({ message: 'Unable to cancel order', detail: error.message });
  }
}
