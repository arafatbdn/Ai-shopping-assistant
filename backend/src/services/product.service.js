import Product from '../models/Product.js';
import '../models/Category.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function searchProducts({ query = '', minPrice, maxPrice, category, limit = 6 } = {}) {
  const filter = {};
  const searchText = query.trim();

  if (searchText) {
    filter.$text = { $search: searchText };
  }
  if (category) filter.tags = { $in: [category.toLowerCase()] };
  if (Number.isFinite(maxPrice) || Number.isFinite(minPrice)) {
    filter.price = {};
    if (Number.isFinite(minPrice)) filter.price.$gte = minPrice;
    if (Number.isFinite(maxPrice)) filter.price.$lte = maxPrice;
  }

  if (searchText) {
    const exactFilter = { ...filter };
    delete exactFilter.$text;
    const exactProducts = await Product.find({ ...exactFilter, name: new RegExp(`^${escapeRegex(searchText)}$`, 'i') })
      .populate('category', 'name slug')
      .limit(Math.min(Math.max(limit, 1), 20));
    if (exactProducts.length) return exactProducts;
  }

  let products;
  try {
    products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(searchText ? { score: { $meta: 'textScore' }, popularityScore: -1 } : { popularityScore: -1, rating: -1 })
      .limit(Math.min(Math.max(limit, 1), 20));
  } catch (error) {
    // Mongo text indexes are created asynchronously in some environments.
    if (!searchText || !error.message.includes('text index')) throw error;
    products = await Product.find({
      $or: [
        { name: new RegExp(searchText, 'i') },
        { brand: new RegExp(searchText, 'i') },
        { tags: new RegExp(searchText, 'i') },
      ],
      ...(Number.isFinite(minPrice) || Number.isFinite(maxPrice) ? { price: { ...(Number.isFinite(minPrice) ? { $gte: minPrice } : {}), ...(Number.isFinite(maxPrice) ? { $lte: maxPrice } : {}) } } : {}),
    }).populate('category', 'name slug').sort({ popularityScore: -1 }).limit(20);
  }

  return products;
}
