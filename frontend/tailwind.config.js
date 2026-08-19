/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07111f',
        mist: '#f5f7fb',
        violet: '#7c5cff',
        mint: '#77e0c3',
      },
      boxShadow: {
        glow: '0 0 80px rgba(124, 92, 255, 0.18)',
      },
    },
  },
  plugins: [],
};
