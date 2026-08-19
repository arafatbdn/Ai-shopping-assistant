import Product from '../../models/Product.js';
import Review from '../../models/Review.js';
import { validId, productSummary } from './tool-utils.js';

export async function summarizeReviews(args = {}) {
  if (!validId(args.productId)) return { ok: false, message: 'Provide a valid product id to summarize reviews.' };
  const [product, reviews] = await Promise.all([
    Product.findById(args.productId).populate('category', 'name').lean(),
    Review.find({ product: args.productId }).select('rating title comment sentiment').limit(100).lean(),
  ]);
  if (!product) return { ok: false, message: 'Product not found.' };
  if (!reviews.length) return { ok: true, product: productSummary(product), reviewCount: 0, summary: 'There are not enough written reviews for a summary yet.' };
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const positive = reviews.filter((review) => review.rating >= 4).length;
  const negative = reviews.filter((review) => review.rating <= 2).length;
  const comments = reviews.filter((review) => review.comment).slice(0, 5).map((review) => review.comment);
  return { ok: true, product: productSummary(product), reviewCount: reviews.length, summary: { averageRating: Number(average.toFixed(1)), positiveReviews: positive, negativeReviews: negative, sampleComments: comments } };
}
