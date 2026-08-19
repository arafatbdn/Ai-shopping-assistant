import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { generateGeminiText } from '../services/gemini.service.js';
import '../models/Category.js';

function compactProduct(product) {
  return {
    name: product.name,
    brand: product.brand,
    price: product.price,
    rating: product.rating,
    reviewCount: product.reviewCount,
    description: product.description,
    specs: product.specs ? Object.fromEntries(product.specs) : {},
  };
}

export async function compareProducts(request, response) {
  try {
    const ids = [...new Set(request.body.productIds || [])].filter((id) => mongoose.isValidObjectId(id));
    if (ids.length < 2) return response.status(400).json({ message: 'Provide at least two valid product ids to compare' });

    const products = await Product.find({ _id: { $in: ids } }).populate('category', 'name');
    if (products.length < 2) return response.status(404).json({ message: 'At least two products were not found' });

    const fallback = `Compared ${products.map((product) => product.name).join(' and ')}. Choose ${products.reduce((best, product) => product.rating > best.rating ? product : best).name} for the strongest rating, or choose the lower-priced option for better budget value.`;
    const analysis = await generateGeminiText({
      systemInstruction: 'You are ShopPilot, an unbiased e-commerce product comparison assistant for AgentShop AI. Use only the supplied catalog facts. Mention pros, cons, best for, and a clear winner in concise plain text.',
      prompt: `Compare these products for the shopper:\n${JSON.stringify(products.map(compactProduct), null, 2)}`,
    });

    response.json({ comparison: analysis || fallback, products });
  } catch (error) {
    response.status(500).json({ message: 'Unable to compare products', detail: error.message });
  }
}

export async function summarizeReviews(request, response) {
  try {
    const { productId } = request.body;
    if (!mongoose.isValidObjectId(productId)) return response.status(400).json({ message: 'A valid product id is required' });

    const [product, reviews] = await Promise.all([
      Product.findById(productId).select('name rating reviewCount'),
      Review.find({ product: productId }).select('rating title comment sentiment').limit(100).lean(),
    ]);
    if (!product) return response.status(404).json({ message: 'Product not found' });
    if (!reviews.length) return response.json({ summary: 'There are not enough written reviews for an AI summary yet.', reviewCount: 0, product });

    const analysis = await generateGeminiText({
      systemInstruction: 'You summarize e-commerce reviews fairly. Return a concise summary with Positive, Negative, and Overall sections. Do not invent facts.',
      prompt: `Summarize the following reviews for ${product.name}:\n${JSON.stringify(reviews)}`,
    });
    const fallback = `${reviews.length} reviews average ${product.rating}/5. Positive feedback is based on the submitted ratings; read individual comments for detailed context.`;
    response.json({ summary: analysis || fallback, reviewCount: reviews.length, product });
  } catch (error) {
    response.status(500).json({ message: 'Unable to summarize reviews', detail: error.message });
  }
}

export async function getUserInsights(request, response) {
  try {
    const orders = await Order.find({ user: request.user._id }).populate({ path: 'items.product', select: 'brand category', populate: { path: 'category', select: 'name' } }).lean();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const categoryCounts = {};
    const brandCounts = {};
    let totalSpent = 0;
    let monthSpent = 0;
    let totalSaved = 0;

    for (const order of orders) {
      totalSpent += order.total || 0;
      if (new Date(order.createdAt) >= monthStart) monthSpent += order.total || 0;
      totalSaved += order.discount || 0;
      for (const item of order.items) {
        const category = item.product?.category?.name || 'Other';
        const brand = item.product?.brand || 'Other';
        categoryCounts[category] = (categoryCounts[category] || 0) + item.quantity;
        brandCounts[brand] = (brandCounts[brand] || 0) + item.quantity;
      }
    }

    const mostPurchasedCategory = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Not enough data';
    const favoriteBrand = Object.entries(brandCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Not enough data';
    response.json({ insights: { totalSpent, monthSpent, totalSaved, orderCount: orders.length, mostPurchasedCategory, favoriteBrand } });
  } catch (error) {
    response.status(500).json({ message: 'Unable to load shopping insights', detail: error.message });
  }
}
