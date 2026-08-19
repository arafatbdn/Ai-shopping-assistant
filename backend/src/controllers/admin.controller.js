import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { generateGeminiText } from '../services/gemini.service.js';

export async function getAdminDashboard(_request, response) {
  try {
    const [orders, products, reviews, customerCount] = await Promise.all([
      Order.find().select('total status createdAt').lean(),
      Product.find().select('name brand price stock rating reviewCount popularityScore').sort({ popularityScore: -1 }).limit(20).lean(),
      Review.find().select('sentiment rating').lean(),
      User.countDocuments({ role: 'customer' }),
    ]);

    const activeOrders = orders.filter((order) => order.status !== 'cancelled');
    const revenue = activeOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const lastThirtyDays = new Date(Date.now() - 30 * 86400000);
    const monthlyRevenue = activeOrders.filter((order) => new Date(order.createdAt) >= lastThirtyDays).reduce((sum, order) => sum + (order.total || 0), 0);
    const sentiment = reviews.reduce((summary, review) => {
      const key = review.sentiment || (review.rating >= 4 ? 'happy' : review.rating <= 2 ? 'frustrated' : 'neutral');
      summary[key] = (summary[key] || 0) + 1;
      return summary;
    }, {});

    response.json({
      summary: { revenue, monthlyRevenue, totalOrders: orders.length, activeOrders: activeOrders.length, customerCount, averageOrderValue: activeOrders.length ? Math.round(revenue / activeOrders.length) : 0 },
      topProducts: products.slice(0, 5),
      lowStock: products.filter((product) => product.stock <= 5).sort((a, b) => a.stock - b.stock),
      sentiment,
      analytics: { sales: activeOrders.map((order) => ({ date: order.createdAt, value: order.total })) },
    });
  } catch (error) {
    response.status(500).json({ message: 'Unable to load admin dashboard', detail: error.message });
  }
}

export function fraudCheck(request, response) {
  const { failedPayments = 0, accountAgeDays = 365, orderAmount = 0, shippingBillingMismatch = false, ordersLastHour = 0 } = request.body;
  let score = 0;
  const flags = [];

  if (failedPayments >= 3) { score += 30; flags.push('Multiple failed payments'); }
  if (accountAgeDays < 7) { score += 25; flags.push('Very new account'); }
  if (orderAmount >= 100000) { score += 20; flags.push('Unusually high order amount'); }
  if (shippingBillingMismatch) { score += 15; flags.push('Shipping and billing mismatch'); }
  if (ordersLastHour >= 5) { score += 20; flags.push('High order velocity'); }

  response.json({ risk: score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low', score: Math.min(score, 100), flags, recommendation: score >= 60 ? 'Hold for manual review and request verification.' : score >= 30 ? 'Request an additional verification step.' : 'Allow order with normal monitoring.' });
}

export async function generateNotification(request, response) {
  try {
    const { customerName = 'there', event = 'a new update', channel = 'push', productName } = request.body;
    const fallback = `Hi ${customerName}, here is an update about ${event}${productName ? ` for ${productName}` : ''}.`;
    const message = await generateGeminiText({
      systemInstruction: 'Write a concise, warm e-commerce notification. Never invent discounts, delivery dates, or promises. Return only the message body.',
      prompt: `Create a ${channel} notification for customer ${customerName}. Event: ${event}. Product: ${productName || 'not specified'}.`,
    });
    response.json({ channel, message: message || fallback });
  } catch (error) {
    response.status(500).json({ message: 'Unable to generate notification', detail: error.message });
  }
}
