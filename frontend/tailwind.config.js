/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f1111',
        navy: {
          DEFAULT: '#131921',
          light: '#232f3e',
          subtle: '#1e293b',
        },
        mist: '#f7f8f8',
        surface: '#ffffff',
        amazon: {
          orange: '#FF9900',
          yellow: '#ffd814',
          amber: '#f3a847',
          dark: '#0f1111',
          gray: '#eaeded',
          border: '#d5d9d9',
          price: '#B12704',
          link: '#007185',
        },
        // Mapped legacy tokens for seamless utility compatibility:
        violet: '#FF9900',
        mint: '#FF9900',
      },
      boxShadow: {
        glow: '0 0 25px rgba(255, 153, 0, 0.25)',
        card: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
