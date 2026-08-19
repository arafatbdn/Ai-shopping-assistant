import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export async function getCart(request, response) {
  const cart = await Cart.findOne({ user: request.user._id }).populate('items.product', 'name brand price originalPrice images stock rating');
  response.json({ cart: cart || { user: request.user._id, items: [] } });
}

export async function addToCart(request, response) {
  const { productId, quantity = 1 } = request.body;
  if (!mongoose.isValidObjectId(productId)) return response.status(400).json({ message: 'A valid product id is required' });

  const product = await Product.findById(productId);
  if (!product) return response.status(404).json({ message: 'Product not found' });
  if (product.stock < quantity) return response.status(409).json({ message: 'Not enough stock available' });

  const cart = await Cart.findOneAndUpdate({ user: request.user._id }, { $setOnInsert: { user: request.user._id } }, { upsert: true, new: true });
  const item = cart.items.find((entry) => entry.product.toString() === productId);
  if (item) item.quantity += Number(quantity);
  else cart.items.push({ product: productId, quantity: Number(quantity) });
  await cart.save();

  await cart.populate('items.product', 'name brand price originalPrice images stock rating');
  response.json({ message: `${product.name} added to your cart`, cart });
}

export async function removeFromCart(request, response) {
  const cart = await Cart.findOneAndUpdate({ user: request.user._id }, { $pull: { items: { product: request.params.productId } } }, { new: true }).populate('items.product', 'name brand price images stock');
  response.json({ cart: cart || { user: request.user._id, items: [] } });
}

export async function updateCartItem(request, response) {
  const quantity = Number(request.body.quantity);
  if (!mongoose.isValidObjectId(request.params.productId) || !Number.isInteger(quantity) || quantity < 1) {
    return response.status(400).json({ message: 'A valid product id and quantity are required' });
  }
  const product = await Product.findById(request.params.productId);
  if (!product) return response.status(404).json({ message: 'Product not found' });
  if (product.stock < quantity) return response.status(409).json({ message: 'Not enough stock available' });
  const cart = await Cart.findOneAndUpdate({ user: request.user._id, 'items.product': request.params.productId }, { $set: { 'items.$.quantity': quantity } }, { new: true }).populate('items.product', 'name brand price originalPrice images stock rating');
  response.json({ cart: cart || { user: request.user._id, items: [] } });
}

export async function clearCart(request, response) {
  const cart = await Cart.findOneAndUpdate({ user: request.user._id }, { $set: { items: [] } }, { new: true });
  response.json({ message: 'Cart cleared', cart: cart || { user: request.user._id, items: [] } });
}
