import {
  Camera,
  Cpu,
  Gamepad2,
  Headphones,
  Laptop,
  Monitor,
  Smartphone,
  Watch,
} from 'lucide-react';

export const assistantSuggestions = [
  'Find a laptop under ৳60,000',
  'Track my latest order',
  'Recommend wireless headphones',
];

export const electronicsCategories = [
  { name: 'Computers', category: 'Computers', slug: 'computers', icon: Cpu, color: 'from-violet-500/25 to-indigo-500/10' },
  { name: 'Laptops', category: 'Laptops', slug: 'laptops', icon: Laptop, color: 'from-cyan-500/25 to-blue-500/10' },
  { name: 'Mobiles', category: 'Mobiles', slug: 'mobiles', icon: Smartphone, color: 'from-mint/25 to-emerald-500/10' },
  { name: 'Monitors', category: 'Monitors', slug: 'monitors', icon: Monitor, color: 'from-orange-500/25 to-amber-500/10' },
  { name: 'Audio', category: 'Audio', slug: 'audio', icon: Headphones, color: 'from-pink-500/25 to-rose-500/10' },
  { name: 'Cameras', category: 'Cameras', slug: 'cameras', icon: Camera, color: 'from-sky-500/25 to-cyan-500/10' },
  { name: 'Gaming', category: 'Gaming Accessories', slug: 'gaming-accessories', icon: Gamepad2, color: 'from-fuchsia-500/25 to-purple-500/10' },
  { name: 'Wearables', category: 'Wearables', slug: 'wearables', icon: Watch, color: 'from-yellow-500/25 to-orange-500/10' },
];
