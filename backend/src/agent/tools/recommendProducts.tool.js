import Product from '../../models/Product.js';
import '../../models/Category.js';
import { productSummary } from './tool-utils.js';

export async function recommendProducts(args = {}) {
  const filter = {};
  if (args.category) filter.tags = { $in: [String(args.category).toLowerCase()] };
  if (Number.isFinite(Number(args.maxPrice))) filter.price = { $lte: Number(args.maxPrice) };
  if (Number.isFinite(Number(args.minPrice))) filter.price = { ...(filter.price || {}), $gte: Number(args.minPrice) };
  if (args.query) filter.$text = { $search: String(args.query) };
  let products;
  try {
    products = await Product.find(filter).populate('category', 'name slug').sort({ popularityScore: -1, rating: -1 }).limit(Math.min(Math.max(Number(args.limit) || 5, 1), 10)).lean();
  } catch (error) {
    if (!filter.$text || !error.message.includes('text index')) throw error;
    delete filter.$text;
    products = await Product.find(filter).populate('category', 'name slug').sort({ popularityScore: -1, rating: -1 }).limit(10).lean();
  }
  return { ok: true, strategy: 'popularity-rating-value', count: products.length, products: products.map((product) => productSummary(product)) };
}
