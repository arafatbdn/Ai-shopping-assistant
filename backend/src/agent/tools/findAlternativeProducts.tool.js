import Product from '../../models/Product.js';
import { validId, productSummary } from './tool-utils.js';

export async function findAlternativeProducts(args = {}) {
  const source = validId(args.productId) ? await Product.findById(args.productId).lean() : null;
  const query = source ? { category: source.category, _id: { $ne: source._id }, price: { $gte: source.price * 0.7, $lte: source.price * 1.3 }, stock: { $gt: 0 } } : { tags: { $in: [String(args.category || 'electronics').toLowerCase()] }, stock: { $gt: 0 } };
  const products = await Product.find(query).populate('category', 'name').sort({ rating: -1, popularityScore: -1 }).limit(Math.min(Math.max(Number(args.limit) || 5, 1), 10)).lean();
  return { ok: true, count: products.length, alternatives: products.map((product) => productSummary(product)) };
}
