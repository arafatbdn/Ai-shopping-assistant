import Product from '../../models/Product.js';
import Wishlist from '../../models/Wishlist.js';
import { requiresAuth, validId, productSummary } from './tool-utils.js';

export async function addToWishlist(user, args = {}) {
  if (!user) return requiresAuth();
  if (!validId(args.productId)) return { ok: false, message: 'A valid product id is required.' };
  const product = await Product.findById(args.productId);
  if (!product) return { ok: false, message: 'Product not found.' };
  const wishlist = await Wishlist.findOneAndUpdate({ user: user._id }, { $setOnInsert: { user: user._id } }, { upsert: true, new: true });
  if (!wishlist.products.some((id) => String(id) === String(product._id))) wishlist.products.push(product._id);
  await wishlist.save();
  return { ok: true, action: 'addToWishlist', message: `${product.name} was saved to your wishlist.`, product: productSummary(product) };
}
