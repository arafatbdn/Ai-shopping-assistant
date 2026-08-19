import Product from '../models/Product.js';
import Category from '../models/Category.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const CATEGORY_SYNONYMS = {
  phone: 'mobiles',
  phones: 'mobiles',
  mobile: 'mobiles',
  mobiles: 'mobiles',
  smartphone: 'mobiles',
  smartphones: 'mobiles',
  cellphone: 'mobiles',
  cellphones: 'mobiles',
  telephone: 'mobiles',
  laptop: 'laptops',
  laptops: 'laptops',
  notebook: 'laptops',
  notebooks: 'laptops',
  macbook: 'laptops',
  chromebook: 'laptops',
  pc: 'computers',
  computer: 'computers',
  computers: 'computers',
  desktop: 'computers',
  desktops: 'computers',
  workstation: 'computers',
  screen: 'monitors',
  screens: 'monitors',
  monitor: 'monitors',
  monitors: 'monitors',
  display: 'monitors',
  displays: 'monitors',
  headphone: 'audio',
  headphones: 'audio',
  earphone: 'audio',
  earphones: 'audio',
  earbuds: 'audio',
  earbud: 'audio',
  audio: 'audio',
  sound: 'audio',
  speaker: 'audio',
  speakers: 'audio',
  camera: 'cameras',
  cameras: 'cameras',
  dslr: 'cameras',
  photography: 'cameras',
  watch: 'wearables',
  watches: 'wearables',
  wearable: 'wearables',
  wearables: 'wearables',
  smartwatch: 'wearables',
  smartwatches: 'wearables',
  game: 'gaming-accessories',
  gaming: 'gaming-accessories',
  gamingaccessories: 'gaming-accessories',
  accessories: 'gaming-accessories',
  accessory: 'gaming-accessories',
  mouse: 'gaming-accessories',
  keyboard: 'gaming-accessories',
};

export async function searchProducts({ query = '', minPrice, maxPrice, category, limit = 12 } = {}) {
  const conditions = [];
  const rawQuery = String(query || '').trim();
  const rawCat = String(category || '').trim();

  // Resolve category slug if provided
  let targetSlug = null;
  if (rawCat) {
    const norm = rawCat.toLowerCase().replace(/[^a-z0-9]+/g, '');
    targetSlug = CATEGORY_SYNONYMS[norm] || CATEGORY_SYNONYMS[rawCat.toLowerCase()] || rawCat.toLowerCase();
  } else if (rawQuery) {
    const words = rawQuery.toLowerCase().split(/\s+/);
    for (const w of words) {
      if (CATEGORY_SYNONYMS[w]) {
        targetSlug = CATEGORY_SYNONYMS[w];
        break;
      }
    }
  }

  // Find matching categories in DB
  let categoryIds = [];
  if (targetSlug) {
    const categoryDocs = await Category.find({
      $or: [
        { slug: targetSlug },
        { slug: new RegExp(escapeRegex(targetSlug), 'i') },
        { name: new RegExp(escapeRegex(targetSlug), 'i') },
      ],
    }).select('_id');
    categoryIds = categoryDocs.map((c) => c._id);
  }

  if (categoryIds.length > 0) {
    conditions.push({
      $or: [
        { category: { $in: categoryIds } },
        { tags: { $in: [targetSlug, rawCat?.toLowerCase()].filter(Boolean) } },
      ],
    });
  }

  if (Number.isFinite(maxPrice) || Number.isFinite(minPrice)) {
    const priceFilter = {};
    if (Number.isFinite(minPrice)) priceFilter.$gte = minPrice;
    if (Number.isFinite(maxPrice)) priceFilter.$lte = maxPrice;
    conditions.push({ price: priceFilter });
  }

  // Determine if query is just a generic category name (e.g. 'phone', 'phones', 'mobiles', 'laptops')
  const isGenericCategoryQuery = rawQuery && (CATEGORY_SYNONYMS[rawQuery.toLowerCase()] || CATEGORY_SYNONYMS[rawQuery.toLowerCase().replace(/[^a-z0-9]+/g, '')]);

  // If query is specific (e.g. 'Realme', 'HP', '5G', 'gaming'), apply text search
  if (rawQuery && !isGenericCategoryQuery) {
    conditions.push({
      $or: [
        { name: new RegExp(escapeRegex(rawQuery), 'i') },
        { brand: new RegExp(escapeRegex(rawQuery), 'i') },
        { description: new RegExp(escapeRegex(rawQuery), 'i') },
        { tags: new RegExp(escapeRegex(rawQuery), 'i') },
      ],
    });
  }

  const finalFilter = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : { $and: conditions }) : {};

  let products = await Product.find(finalFilter)
    .populate('category', 'name slug')
    .sort({ popularityScore: -1, rating: -1, createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 30));

  // Fallback: if no products found with strict filter, but price filter or category was set, try relaxing text
  if (products.length === 0 && conditions.length > 1) {
    const relaxed = [];
    if (categoryIds.length > 0) relaxed.push({ category: { $in: categoryIds } });
    if (Number.isFinite(maxPrice) || Number.isFinite(minPrice)) {
      const priceFilter = {};
      if (Number.isFinite(minPrice)) priceFilter.$gte = minPrice;
      if (Number.isFinite(maxPrice)) priceFilter.$lte = maxPrice;
      relaxed.push({ price: priceFilter });
    }
    if (relaxed.length > 0) {
      products = await Product.find(relaxed.length === 1 ? relaxed[0] : { $and: relaxed })
        .populate('category', 'name slug')
        .sort({ popularityScore: -1, rating: -1, createdAt: -1 })
        .limit(Math.min(Math.max(limit, 1), 30));
    }
  }

  return products;
}

