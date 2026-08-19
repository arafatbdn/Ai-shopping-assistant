const object = (properties = {}, required = []) => ({ type: 'object', properties, ...(required.length ? { required } : {}) });
const string = (description) => ({ type: 'string', description });
const number = (description) => ({ type: 'number', description });
const integer = (description) => ({ type: 'integer', description });

export const shoppingToolDefinitions = [
  { name: 'searchProducts', description: 'Search the live catalog by name, brand, feature, category, or price range.', parameters: object({ query: string('Product or feature phrase'), category: string('Category tag'), minPrice: number('Minimum price in BDT'), maxPrice: number('Maximum price in BDT'), limit: integer('Maximum results') }) },
  { name: 'compareProducts', description: 'Compare two or more catalog products using exact product ids or a query.', parameters: object({ productIds: { type: 'array', items: string('MongoDB product id') }, query: string('Product names to compare') }) },
  { name: 'getProductDetails', description: 'Retrieve complete live details for one product.', parameters: object({ productId: string('MongoDB product id'), query: string('Exact or partial product name') }) },
  { name: 'recommendProducts', description: 'Recommend products ranked by popularity, rating, and value.', parameters: object({ query: string('Need or feature'), category: string('Category tag'), minPrice: number('Minimum price in BDT'), maxPrice: number('Maximum price in BDT'), limit: integer('Maximum results') }) },
  { name: 'searchByBudget', description: 'Find products within a shopper budget.', parameters: object({ budget: number('Maximum budget in BDT'), maxPrice: number('Maximum price in BDT'), category: string('Category tag'), query: string('Product need'), limit: integer('Maximum results') }) },
  { name: 'getCart', description: 'Get the signed-in shopper current cart items, quantities, and subtotal.', parameters: object({}) },
  { name: 'addToCart', description: 'Add a confirmed catalog product to the signed-in shopper cart.', parameters: object({ productId: string('MongoDB product id'), quantity: integer('Quantity') }, ['productId']) },
  { name: 'removeFromCart', description: 'Remove a product from the signed-in shopper cart.', parameters: object({ productId: string('MongoDB product id') }, ['productId']) },
  { name: 'clearCart', description: 'Remove every product from the signed-in shopper cart when the shopper asks to empty or clear the cart.', parameters: object({}) },
  { name: 'getWishlist', description: 'Get the signed-in shopper wishlist products.', parameters: object({}) },
  { name: 'addToWishlist', description: 'Save a catalog product to the signed-in shopper wishlist.', parameters: object({ productId: string('MongoDB product id') }, ['productId']) },
  { name: 'removeFromWishlist', description: 'Remove a product from the signed-in shopper wishlist.', parameters: object({ productId: string('MongoDB product id') }, ['productId']) },
  { name: 'trackOrder', description: 'Track a signed-in shopper order, defaulting to the latest order.', parameters: object({ orderId: string('MongoDB order id') }) },
  { name: 'cancelOrder', description: 'Cancel a signed-in shopper order when its status allows cancellation.', parameters: object({ orderId: string('MongoDB order id') }) },
  { name: 'returnOrder', description: 'Create a return request for an eligible signed-in shopper order.', parameters: object({ orderId: string('MongoDB order id'), reason: string('Return reason') }) },
  { name: 'getUserOrders', description: 'List orders belonging only to the signed-in shopper.', parameters: object({ limit: integer('Maximum orders') }) },
  { name: 'applyBestCoupon', description: 'Find the best active coupon applicable to the signed-in shopper current cart.', parameters: object({}) },
  { name: 'calculateSavings', description: 'Calculate current cart savings against original product prices.', parameters: object({}) },
  { name: 'getShoppingInsights', description: 'Summarize the signed-in shopper purchase patterns and spending.', parameters: object({}) },
  { name: 'checkInventory', description: 'Check live stock availability for a product or query.', parameters: object({ productId: string('MongoDB product id'), query: string('Product name or query') }) },
  { name: 'findAlternativeProducts', description: 'Find in-stock alternatives in a similar category and price range.', parameters: object({ productId: string('Source product id'), category: string('Category tag'), limit: integer('Maximum results') }) },
  { name: 'summarizeReviews', description: 'Summarize stored reviews and ratings for a product.', parameters: object({ productId: string('MongoDB product id') }, ['productId']) },
  { name: 'detectSentiment', description: 'Classify sentiment in shopper feedback.', parameters: object({ text: string('Feedback text') }, ['text']) },
  { name: 'generateInvoice', description: 'Generate a structured invoice for a signed-in shopper order.', parameters: object({ orderId: string('MongoDB order id') }) },
];
