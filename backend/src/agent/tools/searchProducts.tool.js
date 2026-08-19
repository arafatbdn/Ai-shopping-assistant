import { searchProducts as searchCatalog } from '../../services/product.service.js';
import { productSummary } from './tool-utils.js';

export async function searchProducts(args = {}) {
  const products = await searchCatalog({
    query: String(args.query || ''),
    category: args.category,
    minPrice: Number.isFinite(Number(args.minPrice)) ? Number(args.minPrice) : undefined,
    maxPrice: Number.isFinite(Number(args.maxPrice)) ? Number(args.maxPrice) : undefined,
    limit: Math.min(Math.max(Number(args.limit) || 6, 1), 12),
  });
  return { ok: true, count: products.length, products: products.map((product) => productSummary(product)) };
}
