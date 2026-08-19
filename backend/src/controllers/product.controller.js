import mongoose from 'mongoose';
import { searchProducts } from '../services/product.service.js';
import '../models/Category.js';

export async function listProducts(request, response) {
  try {
    const { q = '', category, maxPrice, limit } = request.query;
    const products = await searchProducts({ query: q, category, maxPrice: maxPrice ? Number(maxPrice) : undefined, limit: limit ? Number(limit) : 12 });
    response.json({ products });
  } catch (error) {
    response.status(500).json({ message: 'Unable to search products', detail: error.message });
  }
}

export async function getProduct(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: 'Invalid product id' });
  const Product = (await import('../models/Product.js')).default;
  const product = await Product.findById(request.params.id).populate('category', 'name slug');
  if (!product) return response.status(404).json({ message: 'Product not found' });
  response.json({ product });
}
