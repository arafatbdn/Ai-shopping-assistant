import Wishlist from '../../models/Wishlist.js';
import { requiresAuth, productSummary } from './tool-utils.js';

export async function getWishlist(user) {
  if (!user) return requiresAuth();
  const wishlist = await Wishlist.findOne({ user: user._id }).populate('products', 'name brand price originalPrice images stock rating');
  const products = (wishlist?.products || []).map((product) => productSummary(product));

  if (!products.length) {
    return {
      ok: true,
      found: false,
      itemCount: 0,
      message: 'Your wishlist is currently empty.',
      products: [],
    };
  }

  return {
    ok: true,
    found: true,
    itemCount: products.length,
    products,
    message: `You have ${products.length} product(s) in your wishlist.`,
  };
}
