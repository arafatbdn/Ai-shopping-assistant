import Order from '../../models/Order.js';
import { requiresAuth } from './tool-utils.js';

export async function getShoppingInsights(user) {
  if (!user) return requiresAuth();
  const orders = await Order.find({ user: user._id }).populate({ path: 'items.product', select: 'brand category', populate: { path: 'category', select: 'name' } }).lean();
  const categories = {};
  const brands = {};
  let totalSpent = 0;
  let totalSaved = 0;
  for (const order of orders) {
    totalSpent += order.total || 0;
    totalSaved += order.discount || 0;
    for (const item of order.items) {
      const category = item.product?.category?.name || 'Other';
      const brand = item.product?.brand || 'Other';
      categories[category] = (categories[category] || 0) + item.quantity;
      brands[brand] = (brands[brand] || 0) + item.quantity;
    }
  }
  const top = (values) => Object.entries(values).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Not enough data';
  return { ok: true, insights: { totalSpent, totalSaved, orderCount: orders.length, mostPurchasedCategory: top(categories), favoriteBrand: top(brands) } };
}
