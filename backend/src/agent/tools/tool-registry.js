import { addToCart } from './addToCart.tool.js';
import { addToWishlist } from './addToWishlist.tool.js';
import { applyBestCoupon } from './applyBestCoupon.tool.js';
import { calculateSavings } from './calculateSavings.tool.js';
import { cancelOrder } from './cancelOrder.tool.js';
import { checkInventory } from './checkInventory.tool.js';
import { clearCart } from './clearCart.tool.js';
import { compareProducts } from './compareProducts.tool.js';
import { detectSentiment } from './detectSentiment.tool.js';
import { findAlternativeProducts } from './findAlternativeProducts.tool.js';
import { generateInvoice } from './generateInvoice.tool.js';
import { getProductDetails } from './getProductDetails.tool.js';
import { getShoppingInsights } from './getShoppingInsights.tool.js';
import { getUserOrders } from './getUserOrders.tool.js';
import { recommendProducts } from './recommendProducts.tool.js';
import { removeFromCart } from './removeFromCart.tool.js';
import { removeFromWishlist } from './removeFromWishlist.tool.js';
import { returnOrder } from './returnOrder.tool.js';
import { searchByBudget } from './searchByBudget.tool.js';
import { searchProducts } from './searchProducts.tool.js';
import { summarizeReviews } from './summarizeReviews.tool.js';
import { trackOrder } from './trackOrder.tool.js';

export const shoppingToolServices = {
  searchProducts: (args) => searchProducts(args),
  compareProducts: (args) => compareProducts(args),
  getProductDetails: (args) => getProductDetails(args),
  recommendProducts: (args) => recommendProducts(args),
  searchByBudget: (args) => searchByBudget(args),
  addToCart: (args, context) => addToCart(context.user, args),
  removeFromCart: (args, context) => removeFromCart(context.user, args),
  clearCart: (_args, context) => clearCart(context.user),
  addToWishlist: (args, context) => addToWishlist(context.user, args),
  removeFromWishlist: (args, context) => removeFromWishlist(context.user, args),
  trackOrder: (args, context) => trackOrder(context.user, args),
  cancelOrder: (args, context) => cancelOrder(context.user, args),
  returnOrder: (args, context) => returnOrder(context.user, args),
  getUserOrders: (args, context) => getUserOrders(context.user, args),
  applyBestCoupon: (_args, context) => applyBestCoupon(context.user),
  calculateSavings: (_args, context) => calculateSavings(context.user),
  getShoppingInsights: (_args, context) => getShoppingInsights(context.user),
  checkInventory: (args) => checkInventory(args),
  findAlternativeProducts: (args) => findAlternativeProducts(args),
  summarizeReviews: (args) => summarizeReviews(args),
  detectSentiment: (args) => detectSentiment(args),
  generateInvoice: (args, context) => generateInvoice(context.user, args),
};

export async function executeShoppingTool(name, args = {}, context = {}) {
  const service = shoppingToolServices[name];
  if (!service) return { ok: false, message: `Unknown shopping tool: ${name}` };
  return service(args, context);
}
