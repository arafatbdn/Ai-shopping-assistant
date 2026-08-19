import Product from '../../models/Product.js';
import { validId, productSummary } from './tool-utils.js';

export async function getProductDetails(args = {}) {
  const filter = validId(args.productId) ? { _id: args.productId } : { name: new RegExp(String(args.query || ''), 'i') };
  if (!args.productId && !args.query) return { ok: false, message: 'Provide a product id or product name.' };
  const product = await Product.findOne(filter).populate('category', 'name slug').lean();
  if (!product) return { ok: false, message: 'Product not found.' };
  return { ok: true, product: productSummary(product) };
}
