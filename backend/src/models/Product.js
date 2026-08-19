import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    brand: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    stock: { type: Number, default: 0, min: 0 },
    images: [{ type: String }],
    tags: [{ type: String, trim: true, lowercase: true }],
    specs: { type: Map, of: String },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    popularityScore: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

productSchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' });
productSchema.index({ price: 1, popularityScore: -1 });

export default mongoose.model('Product', productSchema);
