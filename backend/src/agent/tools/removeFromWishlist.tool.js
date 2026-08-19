import Wishlist from '../../models/Wishlist.js';
import { requiresAuth } from './tool-utils.js';

export async function removeFromWishlist(user, args = {}) {
  if (!user) return requiresAuth();
  if (!args.productId) return { ok: false, message: 'Provide the product id to remove.' };
  const wishlist = await Wishlist.findOneAndUpdate({ user: user._id }, { $pull: { products: args.productId } }, { new: true }).populate('products', 'name brand price images stock rating');
  return { ok: true, action: 'removeFromWishlist', message: 'The product was removed from your wishlist.', products: wishlist?.products || [] };
}
