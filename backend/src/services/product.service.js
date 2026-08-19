import Product from '../models/Product.js';
import Category from '../models/Category.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function searchProducts({ query = '', minPrice, maxPrice, category, limit = 12 } = {}) {
  const conditions = [];
  const searchText = String(query || '').trim();

  if (category) {
    const cleanCat = String(category).trim();
    const categoryDocs = await Category.find({
      $or: [
        { slug: cleanCat.toLowerCase() },
        { slug: cleanCat.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
        { name: new RegExp(`^${escapeRegex(cleanCat)}$`, 'i') },
      ],
    }).select('_id');
    const categoryIds = categoryDocs.map((c) => c._id);

    if (categoryIds.length) {
      conditions.push({
        $or: [
          { category: { $in: categoryIds } },
          { tags: { $in: [cleanCat.toLowerCase()] } },
        ],
      });
    } else {
      conditions.push({ tags: { $in: [cleanCat.toLowerCase()] } });
    }
  }

  if (Number.isFinite(maxPrice) || Number.isFinite(minPrice)) {
    const priceFilter = {};
    if (Number.isFinite(minPrice)) priceFilter.$gte = minPrice;
    if (Number.isFinite(maxPrice)) priceFilter.$lte = maxPrice;
    conditions.push({ price: priceFilter });
  }

  if (searchText) {
    const baseFilter = conditions.length ? (conditions.length === 1 ? conditions[0] : { $and: conditions }) : {};
    const exactProducts = await Product.find({
      ...baseFilter,
      name: new RegExp(`^${escapeRegex(searchText)}$`, 'i'),
    })
      .populate('category', 'name slug')
      .limit(Math.min(Math.max(limit, 1), 30));

    if (exactProducts.length) return exactProducts;
  }

  const textConditions = [...conditions];
  if (searchText) {
    textConditions.push({
      $or: [
        { name: new RegExp(escapeRegex(searchText), 'i') },
        { brand: new RegExp(escapeRegex(searchText), 'i') },
        { description: new RegExp(escapeRegex(searchText), 'i') },
        { tags: new RegExp(escapeRegex(searchText), 'i') },
      ],
    });
  }

  const finalFilter = textConditions.length > 0 ? (textConditions.length === 1 ? textConditions[0] : { $and: textConditions }) : {};

  const products = await Product.find(finalFilter)
    .populate('category', 'name slug')
    .sort({ createdAt: -1, popularityScore: -1, rating: -1 })
    .limit(Math.min(Math.max(limit, 1), 30));

  return products;
}

