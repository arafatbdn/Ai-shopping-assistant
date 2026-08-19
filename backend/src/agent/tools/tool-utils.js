import mongoose from 'mongoose';

export function requiresAuth() {
  return { ok: false, requiresAuth: true, message: 'Please sign in before using this account tool.' };
}

export function validId(value) {
  return mongoose.isValidObjectId(value);
}

export function productSummary(product, extra = {}) {
  const firstImage = product?.images?.length ? product.images[0] : (product?.image || null);
  const safeImage = (typeof firstImage === 'string' && !firstImage.startsWith('data:')) ? firstImage : null;
  return {
    id: String(product?._id || product?.id),
    name: product?.name || '',
    brand: product?.brand || '',
    price: product?.price ?? 0,
    originalPrice: product?.originalPrice,
    discountPercentage: product?.discountPercentage,
    stock: product?.stock ?? 0,
    rating: product?.rating ?? 0,
    reviewCount: product?.reviewCount ?? 0,
    description: product?.description || '',
    category: product?.category?.name || product?.category || '',
    specs: product?.specs instanceof Map ? Object.fromEntries(product.specs) : product?.specs || {},
    ...(safeImage ? { image: safeImage } : {}),
    ...extra,
  };
}

export function orderSummary(order) {
  return {
    id: String(order._id),
    status: order.status,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber || null,
    total: order.total,
    createdAt: order.createdAt,
    estimatedDelivery: order.estimatedDelivery || null,
    shippingAddress: order.shippingAddress,
  };
}

export function cartSummary(cart) {
  const items = cart?.items || [];
  return {
    id: cart?._id ? String(cart._id) : null,
    items: items.map((item) => ({
      product: item.product ? productSummary(item.product) : String(item.product),
      quantity: item.quantity,
      lineTotal: (item.product?.price || 0) * item.quantity,
    })),
    subtotal: items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0),
  };
}
