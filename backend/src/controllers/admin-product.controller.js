import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Wishlist from '../models/Wishlist.js';
import mongoose from 'mongoose';

function slugify(value) {
  return value.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function createAdminProduct(request, response) {
  try {
    const { name, brand, category, description, price, originalPrice, stock, tags = '' } = request.body;
    if (!name?.trim() || !brand?.trim() || !category?.trim() || !description?.trim() || !price || stock === undefined) {
      return response.status(400).json({ message: 'Name, brand, category, description, price, and stock are required' });
    }

    const categorySlug = slugify(category);
    const categoryDocument = await Category.findOneAndUpdate(
      { slug: categorySlug },
      { $setOnInsert: { name: category.trim(), slug: categorySlug } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const productSlug = slugify(name);
    const existingProduct = await Product.findOne({ slug: productSlug });
    if (existingProduct) return response.status(409).json({ message: 'A product with this name already exists' });

    const numericPrice = Number(price);
    const numericOriginalPrice = originalPrice ? Number(originalPrice) : numericPrice;
    const image = request.file ? `data:${request.file.mimetype};base64,${request.file.buffer.toString('base64')}` : null;
    const product = await Product.create({
      name: name.trim(),
      slug: productSlug,
      brand: brand.trim(),
      category: categoryDocument._id,
      description: description.trim(),
      price: numericPrice,
      originalPrice: numericOriginalPrice,
      discountPercentage: numericOriginalPrice > numericPrice ? Math.round(((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100) : 0,
      stock: Number(stock),
      tags: tags.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean),
      images: image ? [image] : [],
      rating: 0,
      reviewCount: 0,
      popularityScore: 0,
    });

    response.status(201).json({ message: 'Product uploaded successfully', product });
  } catch (error) {
    response.status(500).json({ message: 'Unable to create product', detail: error.message });
  }
}

export async function listAdminProducts(_request, response) {
  try {
    const products = await Product.find()
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .lean();
    const formatted = products.map((product) => ({
      id: product._id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      rating: product.rating,
      reviewCount: product.reviewCount,
      popularityScore: product.popularityScore,
      isFeatured: product.isFeatured,
      category: product.category?.name || '',
      categorySlug: product.category?.slug || '',
      image: Array.isArray(product.images) && product.images.length ? product.images[0] : null,
      createdAt: product.createdAt,
    }));
    response.json({ products: formatted });
  } catch (error) {
    response.status(500).json({ message: 'Unable to load products', detail: error.message });
  }
}

export async function deleteAdminProduct(request, response) {
  const { id } = request.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).json({ message: 'Invalid product id' });
  }
  try {
    const product = await Product.findById(id);
    if (!product) return response.status(404).json({ message: 'Product not found' });

    await Promise.all([
      Cart.updateMany({ 'items.product': id }, { $pull: { items: { product: id } } }),
      Wishlist.updateMany({ products: id }, { $pull: { products: id } }),
      Order.updateMany(
        { 'items.product': id },
        { $set: { 'items.$[item].product': null, 'items.$[item].removedAt': new Date() } },
        { arrayFilters: [{ 'item.product': id }] },
      ),
    ]);

    await product.deleteOne();

    response.json({
      message: 'Product deleted',
      productId: id,
      cleaned: { carts: true, wishlists: true, orders: true },
    });
  } catch (error) {
    response.status(500).json({ message: 'Unable to delete product', detail: error.message });
  }
}
