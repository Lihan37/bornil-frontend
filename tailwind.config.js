/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pearl: '#fffaf6',
        blush: '#f8e8e3',
        roseGold: '#b76e79',
        champagne: '#f2dcc2',
        antiqueGold: '#b78b3e',
        ink: '#2b2528',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        soft: '0 18px 55px rgba(74, 40, 48, 0.10)',
      },
    },
  },
  plugins: [],
};
