import mongoose from 'mongoose';
import Cart from '../../models/Cart.js';
import Product from '../../models/Product.js';
import { requiresAuth, productSummary } from './tool-utils.js';

export async function addToCart(user, args = {}) {
  if (!user) return requiresAuth();
  if (!mongoose.isValidObjectId(args.productId)) return { ok: false, message: 'A valid product id is required.' };
  const quantity = Math.min(Math.max(Number(args.quantity) || 1, 1), 10);
  const product = await Product.findById(args.productId);
  if (!product) return { ok: false, message: 'Product not found.' };
  if (product.stock < quantity) return { ok: false, message: `${product.name} does not have enough stock.` };
  const cart = await Cart.findOneAndUpdate({ user: user._id }, { $setOnInsert: { user: user._id } }, { upsert: true, new: true });
  const item = cart.items.find((entry) => String(entry.product) === String(product._id));
  if (item) item.quantity += quantity;
  else cart.items.push({ product: product._id, quantity });
  await cart.save();
  return { ok: true, action: 'addToCart', message: `${product.name} was added to your cart.`, product: productSummary(product, { quantity }) };
}
