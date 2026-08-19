import Product from '../../models/Product.js';
import { productSummary } from './tool-utils.js';

export async function checkInventory(args = {}) {
  const filter = args.productId ? { _id: args.productId } : args.query ? { name: new RegExp(String(args.query), 'i') } : {};
  const products = await Product.find(filter).select('name brand price stock images rating').limit(10).lean();
  return { ok: true, count: products.length, inventory: products.map((product) => ({ ...productSummary(product), available: product.stock > 0, lowStock: product.stock > 0 && product.stock <= 5 })) };
}
