import Product from '../../models/Product.js';
import { searchProducts } from './searchProducts.tool.js';
import { validId, productSummary } from './tool-utils.js';

export async function compareProducts(args = {}) {
  let products = [];
  const ids = [...new Set((args.productIds || []).filter(validId))];
  if (ids.length) products = await Product.find({ _id: { $in: ids } }).populate('category', 'name').lean();
  else if (args.query) products = (await searchProducts({ query: args.query, limit: 4 })).products;
  if (products.length < 2) return { ok: false, message: 'Provide at least two product names or ids to compare.' };
  const summaries = products.map((product) => productSummary(product));
  const bestRated = [...summaries].sort((a, b) => b.rating - a.rating)[0];
  const bestValue = [...summaries].sort((a, b) => (a.price / Math.max(a.rating, 1)) - (b.price / Math.max(b.rating, 1)))[0];
  return { ok: true, products: summaries, comparison: { bestRated: bestRated.name, bestValue: bestValue.name, lowestPrice: [...summaries].sort((a, b) => a.price - b.price)[0].name } };
}
