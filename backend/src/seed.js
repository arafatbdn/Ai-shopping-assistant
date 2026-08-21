import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Cart, Category, Coupon, Order, Product, User, Wishlist } from './models/index.js';

dotenv.config();

const categories = [
  { name: 'Computers', slug: 'computers', description: 'Desktop computers and workstations.' },
  { name: 'Laptops', slug: 'laptops', description: 'Work, study, and gaming laptops.' },
  { name: 'Mobiles', slug: 'mobiles', description: 'Smartphones and mobile devices.' },
  { name: 'Monitors', slug: 'monitors', description: 'Displays for work, study, and play.' },
  { name: 'Audio', slug: 'audio', description: 'Headphones, earbuds, and speakers.' },
  { name: 'Cameras', slug: 'cameras', description: 'Cameras and photography gear.' },
  { name: 'Gaming Accessories', slug: 'gaming-accessories', description: 'Gear for better play.' },
  { name: 'Wearables', slug: 'wearables', description: 'Smart watches and fitness trackers.' },
];

const products = [
  { name: 'HP Pavilion Desktop', slug: 'hp-pavilion-desktop', brand: 'HP', category: 'computers', description: 'A dependable desktop setup for home, office, and everyday productivity.', price: 72900, originalPrice: 79900, discountPercentage: 9, stock: 6, tags: ['computer', 'desktop', 'work'], rating: 4.4, reviewCount: 74, popularityScore: 82, specs: { processor: 'Intel Core i5', ram: '16GB', storage: '512GB SSD' } },
  { name: 'ASUS Vivobook 15', slug: 'asus-vivobook-15', brand: 'ASUS', category: 'laptops', description: 'A balanced everyday laptop with a bright 15.6-inch display and fast SSD storage.', price: 57900, originalPrice: 64900, discountPercentage: 11, stock: 12, tags: ['laptop', 'student', 'work', 'budget'], rating: 4.6, reviewCount: 184, popularityScore: 92, isFeatured: true, specs: { processor: 'Intel Core i5', ram: '16GB', storage: '512GB SSD' } },
  { name: 'Lenovo LOQ 15 Gaming', slug: 'lenovo-loq-15-gaming', brand: 'Lenovo', category: 'laptops', description: 'Performance-first gaming laptop with a high-refresh display and dedicated graphics.', price: 89900, originalPrice: 99900, discountPercentage: 10, stock: 7, tags: ['laptop', 'gaming', 'performance'], rating: 4.8, reviewCount: 96, popularityScore: 98, isFeatured: true, specs: { processor: 'AMD Ryzen 7', ram: '16GB', storage: '512GB SSD', graphics: 'RTX 4060' } },
  { name: 'Samsung Galaxy A55', slug: 'samsung-galaxy-a55', brand: 'Samsung', category: 'mobiles', description: 'A stylish 5G smartphone with a vivid AMOLED display and reliable all-day battery.', price: 42900, originalPrice: 46900, discountPercentage: 9, stock: 14, tags: ['mobile', 'phone', '5g', 'smartphone'], rating: 4.6, reviewCount: 156, popularityScore: 94, isFeatured: true, specs: { display: '6.6-inch AMOLED', storage: '256GB', network: '5G' } },
  { name: 'Xiaomi Redmi Note 13', slug: 'xiaomi-redmi-note-13', brand: 'Xiaomi', category: 'mobiles', description: 'High-value smartphone with a smooth display, capable camera, and fast charging.', price: 24900, originalPrice: 27900, discountPercentage: 11, stock: 22, tags: ['mobile', 'phone', 'budget', 'smartphone'], rating: 4.5, reviewCount: 203, popularityScore: 90, specs: { display: '6.67-inch AMOLED', storage: '128GB', camera: '108MP' } },
  { name: 'AOC 24G2 Gaming Monitor', slug: 'aoc-24g2-gaming-monitor', brand: 'AOC', category: 'monitors', description: 'A responsive 24-inch gaming monitor with a fast refresh rate and vivid colors.', price: 18900, originalPrice: 21900, discountPercentage: 14, stock: 8, tags: ['monitor', 'gaming', 'display'], rating: 4.7, reviewCount: 89, popularityScore: 86, specs: { size: '24-inch', refreshRate: '144Hz', panel: 'IPS' } },
  { name: 'Anker Soundcore Q45', slug: 'anker-soundcore-q45', brand: 'Anker', category: 'audio', description: 'Comfortable wireless headphones with adaptive noise cancellation and long battery life.', price: 14900, originalPrice: 17900, discountPercentage: 17, stock: 21, tags: ['headphones', 'wireless', 'noise cancelling'], rating: 4.7, reviewCount: 321, popularityScore: 95, isFeatured: true, specs: { battery: '50 hours', connectivity: 'Bluetooth 5.3', microphone: 'Built-in' } },
  { name: 'Sony WF-C700N', slug: 'sony-wf-c700n', brand: 'Sony', category: 'audio', description: 'Lightweight true wireless earbuds with clear sound and everyday noise cancellation.', price: 8900, originalPrice: 10900, discountPercentage: 18, stock: 0, tags: ['earbuds', 'wireless', 'compact'], rating: 4.5, reviewCount: 207, popularityScore: 88, specs: { battery: '15 hours', connectivity: 'Bluetooth 5.2', waterResistance: 'IPX4' } },
  { name: 'Canon EOS R50', slug: 'canon-eos-r50', brand: 'Canon', category: 'cameras', description: 'Compact mirrorless camera for sharp travel, creator, and family photography.', price: 78900, originalPrice: 84900, discountPercentage: 7, stock: 4, tags: ['camera', 'mirrorless', 'creator'], rating: 4.8, reviewCount: 61, popularityScore: 84, specs: { sensor: 'APS-C', video: '4K', lensMount: 'RF' } },
  { name: 'Logitech G502 X', slug: 'logitech-g502-x', brand: 'Logitech', category: 'gaming-accessories', description: 'Customizable lightweight gaming mouse with accurate optical sensor.', price: 7600, originalPrice: 8900, discountPercentage: 15, stock: 18, tags: ['gaming mouse', 'mouse', 'gaming'], rating: 4.8, reviewCount: 142, popularityScore: 91, isFeatured: true, specs: { sensor: 'HERO 25K', buttons: '13 programmable', connection: 'Wired USB' } },
  { name: 'Keychron K2 Wireless', slug: 'keychron-k2-wireless', brand: 'Keychron', category: 'gaming-accessories', description: 'Compact mechanical keyboard with hot-swappable switches and multi-device pairing.', price: 10900, originalPrice: 12900, discountPercentage: 16, stock: 9, tags: ['gaming keyboard', 'keyboard', 'mechanical'], rating: 4.7, reviewCount: 118, popularityScore: 89, specs: { layout: '75%', switches: 'Mechanical', connection: 'Bluetooth / USB-C' } },
  { name: 'Amazfit Active Smartwatch', slug: 'amazfit-active-smartwatch', brand: 'Amazfit', category: 'wearables', description: 'Lightweight smartwatch with health tracking, GPS, and a bright AMOLED screen.', price: 12900, originalPrice: 14900, discountPercentage: 13, stock: 11, tags: ['wearable', 'smartwatch', 'fitness'], rating: 4.5, reviewCount: 77, popularityScore: 80, specs: { display: 'AMOLED', battery: '14 days', gps: 'Built-in' } },
  { name: 'Dell Inspiron Desktop', slug: 'dell-inspiron-desktop', brand: 'Dell', category: 'computers', description: 'Reliable desktop computer for office work, study, and everyday multitasking.', price: 64900, originalPrice: 69900, discountPercentage: 7, stock: 9, tags: ['computer', 'desktop', 'office'], rating: 4.5, reviewCount: 63, popularityScore: 78, specs: { processor: 'Intel Core i5', ram: '8GB', storage: '512GB SSD' } },
  { name: 'Lenovo ThinkCentre Neo', slug: 'lenovo-thinkcentre-neo', brand: 'Lenovo', category: 'computers', description: 'Compact business desktop with efficient performance for workspaces and classrooms.', price: 58900, originalPrice: 62900, discountPercentage: 6, stock: 7, tags: ['computer', 'desktop', 'business'], rating: 4.4, reviewCount: 48, popularityScore: 75, specs: { processor: 'Intel Core i5', ram: '16GB', storage: '512GB SSD' } },
  { name: 'HP 15s Laptop', slug: 'hp-15s-laptop', brand: 'HP', category: 'laptops', description: 'Slim everyday laptop for students, remote work, and home productivity.', price: 52900, originalPrice: 57900, discountPercentage: 9, stock: 15, tags: ['laptop', 'student', 'work', 'budget'], rating: 4.4, reviewCount: 137, popularityScore: 86, specs: { processor: 'Intel Core i5', ram: '8GB', storage: '512GB SSD' } },
  { name: 'Acer Aspire 5', slug: 'acer-aspire-5', brand: 'Acer', category: 'laptops', description: 'Versatile 15-inch laptop with a comfortable keyboard and fast solid-state storage.', price: 61900, originalPrice: 67900, discountPercentage: 9, stock: 10, tags: ['laptop', 'office', 'student', 'performance'], rating: 4.5, reviewCount: 112, popularityScore: 84, specs: { processor: 'AMD Ryzen 5', ram: '16GB', storage: '512GB SSD' } },
  { name: 'OnePlus Nord CE 4', slug: 'oneplus-nord-ce-4', brand: 'OnePlus', category: 'mobiles', description: 'Fast 5G mobile with a smooth AMOLED display, large battery, and quick charging.', price: 32900, originalPrice: 35900, discountPercentage: 8, stock: 18, tags: ['mobile', 'phone', '5g', 'smartphone'], rating: 4.6, reviewCount: 129, popularityScore: 89, specs: { display: '6.7-inch AMOLED', storage: '256GB', network: '5G' } },
  { name: 'Realme 12 Pro', slug: 'realme-12-pro', brand: 'Realme', category: 'mobiles', description: 'Stylish camera-focused smartphone with a bright display and all-day battery.', price: 29900, originalPrice: 33900, discountPercentage: 12, stock: 20, tags: ['mobile', 'phone', 'camera', 'budget'], rating: 4.4, reviewCount: 98, popularityScore: 85, specs: { display: '6.7-inch OLED', storage: '256GB', camera: '50MP' } },
  { name: 'Dell S2421 Monitor', slug: 'dell-s2421-monitor', brand: 'Dell', category: 'monitors', description: 'Full HD IPS monitor with eye comfort features for home and office desks.', price: 16900, originalPrice: 18900, discountPercentage: 11, stock: 13, tags: ['monitor', 'display', 'office'], rating: 4.5, reviewCount: 76, popularityScore: 82, specs: { size: '24-inch', refreshRate: '75Hz', panel: 'IPS' } },
  { name: 'LG UltraGear 27GN', slug: 'lg-ultragear-27gn', brand: 'LG', category: 'monitors', description: 'Fast gaming monitor with vivid colors, low latency, and a high refresh rate.', price: 32900, originalPrice: 36900, discountPercentage: 11, stock: 6, tags: ['monitor', 'gaming', 'display'], rating: 4.7, reviewCount: 91, popularityScore: 90, specs: { size: '27-inch', refreshRate: '144Hz', panel: 'IPS' } },
  { name: 'JBL Tune 770NC', slug: 'jbl-tune-770nc', brand: 'JBL', category: 'audio', description: 'Wireless noise-cancelling headphones with punchy sound and long battery life.', price: 11900, originalPrice: 14900, discountPercentage: 20, stock: 19, tags: ['headphones', 'wireless', 'noise cancelling'], rating: 4.6, reviewCount: 219, popularityScore: 93, specs: { battery: '70 hours', connectivity: 'Bluetooth 5.3', microphone: 'Built-in' } },
  { name: 'Bose QuietComfort 45', slug: 'bose-quietcomfort-45', brand: 'Bose', category: 'audio', description: 'Premium comfortable headphones with balanced sound and effective noise cancellation.', price: 29900, originalPrice: 34900, discountPercentage: 14, stock: 5, tags: ['headphones', 'wireless', 'premium'], rating: 4.8, reviewCount: 166, popularityScore: 91, specs: { battery: '24 hours', connectivity: 'Bluetooth 5.1', microphone: 'Built-in' } },
  { name: 'Sony ZV-E10', slug: 'sony-zv-e10', brand: 'Sony', category: 'cameras', description: 'Creator-friendly mirrorless camera with sharp 4K video and interchangeable lenses.', price: 69800, originalPrice: 74900, discountPercentage: 7, stock: 5, tags: ['camera', 'mirrorless', 'creator', 'video'], rating: 4.7, reviewCount: 84, popularityScore: 88, specs: { sensor: 'APS-C', video: '4K', lensMount: 'E-mount' } },
  { name: 'DJI Osmo Pocket 3', slug: 'dji-osmo-pocket-3', brand: 'DJI', category: 'cameras', description: 'Pocket-sized stabilized camera for smooth travel videos and everyday creators.', price: 56900, originalPrice: 61900, discountPercentage: 8, stock: 4, tags: ['camera', 'creator', 'video', 'portable'], rating: 4.8, reviewCount: 72, popularityScore: 87, specs: { sensor: '1-inch', video: '4K 120fps', stabilization: '3-axis gimbal' } },
  { name: 'Razer BlackShark V2', slug: 'razer-blackshark-v2', brand: 'Razer', category: 'gaming-accessories', description: 'Competitive gaming headset with a clear microphone and immersive surround sound.', price: 8900, originalPrice: 10900, discountPercentage: 18, stock: 12, tags: ['gaming', 'headset', 'audio', 'accessories'], rating: 4.6, reviewCount: 153, popularityScore: 90, specs: { connection: 'USB / 3.5mm', microphone: 'Noise cancelling', surround: '7.1' } },
  { name: '8BitDo Ultimate Controller', slug: '8bitdo-ultimate-controller', brand: '8BitDo', category: 'gaming-accessories', description: 'Wireless game controller with precision sticks, charging dock, and multi-platform support.', price: 6900, originalPrice: 7900, discountPercentage: 13, stock: 14, tags: ['gaming', 'controller', 'accessories', 'wireless'], rating: 4.7, reviewCount: 104, popularityScore: 88, specs: { connection: 'Wireless / USB', battery: '22 hours', compatibility: 'PC / Switch' } },
  { name: 'Samsung Galaxy Watch6', slug: 'samsung-galaxy-watch6', brand: 'Samsung', category: 'wearables', description: 'Smartwatch with health tracking, sleep insights, GPS, and a vivid AMOLED display.', price: 24900, originalPrice: 28900, discountPercentage: 14, stock: 8, tags: ['wearable', 'smartwatch', 'fitness', 'health'], rating: 4.6, reviewCount: 105, popularityScore: 86, specs: { display: 'AMOLED', battery: '40 hours', gps: 'Built-in' } },
  { name: 'Huawei Band 9', slug: 'huawei-band-9', brand: 'Huawei', category: 'wearables', description: 'Lightweight fitness band with heart-rate monitoring, sleep tracking, and a bright screen.', price: 5900, originalPrice: 6900, discountPercentage: 14, stock: 24, tags: ['wearable', 'fitness', 'smartwatch', 'health'], rating: 4.4, reviewCount: 88, popularityScore: 79, specs: { display: 'AMOLED', battery: '14 days', waterResistance: '5 ATM' } },
];

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI before running the seed script');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });

  const categoryDocuments = {};
  for (const category of categories) {
    categoryDocuments[category.slug] = await Category.findOneAndUpdate({ slug: category.slug }, category, { upsert: true, new: true, setDefaultsOnInsert: true });
  }

  const productDocuments = [];
  for (const product of products) {
    const document = await Product.findOneAndUpdate({ slug: product.slug }, { ...product, category: categoryDocuments[product.category]._id }, { upsert: true, new: true, setDefaultsOnInsert: true });
    productDocuments.push(document);
  }

  const passwordHash = await bcrypt.hash('NovaDemo123!', 12);
  const demoUser = await User.findOneAndUpdate(
    { email: 'demo@nova.shop' },
    { name: 'Demo Shopper', email: 'demo@nova.shop', passwordHash, interests: ['gaming', 'audio'], preferences: { language: 'en', budget: 60000, favoriteBrands: ['ASUS', 'Anker'] } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await User.findOneAndUpdate(
    { email: 'admin@nova.shop' },
    { name: 'Admin', email: 'admin@nova.shop', role: 'admin', passwordHash, interests: ['electronics', 'analytics'], preferences: { language: 'en' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await Cart.findOneAndUpdate({ user: demoUser._id }, { user: demoUser._id, items: [{ product: productDocuments[0]._id, quantity: 1 }] }, { upsert: true, new: true, setDefaultsOnInsert: true });
  await Wishlist.findOneAndUpdate({ user: demoUser._id }, { user: demoUser._id, products: [productDocuments[1]._id, productDocuments[2]._id] }, { upsert: true, new: true, setDefaultsOnInsert: true });
  const demoOrderExists = await Order.exists({ user: demoUser._id });
  if (!demoOrderExists) {
    await Order.create({ user: demoUser._id, items: [{ product: productDocuments[2]._id, name: productDocuments[2].name, quantity: 1, price: productDocuments[2].price }], subtotal: productDocuments[2].price, total: productDocuments[2].price, status: 'shipped', paymentStatus: 'paid', trackingNumber: 'NOVA-BD-20481', estimatedDelivery: new Date(Date.now() + 2 * 86400000), shippingAddress: 'Dhaka, Bangladesh' });
  }
  await Coupon.findOneAndUpdate({ code: 'NOVA10' }, { code: 'NOVA10', discountType: 'percentage', value: 10, minimumOrder: 5000, maxDiscount: 3000, expiresAt: new Date(Date.now() + 30 * 86400000), active: true }, { upsert: true, new: true, setDefaultsOnInsert: true });

  console.log(`Seeded ${productDocuments.length} products, demo shopper demo@nova.shop / NovaDemo123!, and admin admin@nova.shop / NovaDemo123!`);
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  if (mongoose.connection.readyState) await mongoose.disconnect();
});
