import { searchProducts } from './searchProducts.tool.js';

export async function searchByBudget(args = {}) {
  const maxPrice = Number(args.maxPrice || args.budget);
  if (!Number.isFinite(maxPrice) || maxPrice <= 0) return { ok: false, message: 'Provide a valid maximum budget.' };
  return searchProducts({ ...args, maxPrice, limit: args.limit || 8 });
}
