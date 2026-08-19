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
  { name: 'Computers', query: 'computers', icon: Cpu, color: 'from-violet-500/25 to-indigo-500/10' },
  { name: 'Laptops', query: 'laptops', icon: Laptop, color: 'from-cyan-500/25 to-blue-500/10' },
  { name: 'Mobiles', query: 'mobile phones', icon: Smartphone, color: 'from-mint/25 to-emerald-500/10' },
  { name: 'Monitors', query: 'monitors', icon: Monitor, color: 'from-orange-500/25 to-amber-500/10' },
  { name: 'Audio', query: 'headphones and earbuds', icon: Headphones, color: 'from-pink-500/25 to-rose-500/10' },
  { name: 'Cameras', query: 'cameras', icon: Camera, color: 'from-sky-500/25 to-cyan-500/10' },
  { name: 'Gaming', query: 'gaming accessories', icon: Gamepad2, color: 'from-fuchsia-500/25 to-purple-500/10' },
  { name: 'Wearables', query: 'smart watches', icon: Watch, color: 'from-yellow-500/25 to-orange-500/10' },
];
