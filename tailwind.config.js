/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pearl: '#fffaf6',
        blush: '#f8e8e3',
        blushDeep: '#f0d6cf',
        roseGold: '#b76e79',
        roseDeep: '#8f4f59',
        champagne: '#f2dcc2',
        goldLight: '#e2c088',
        antiqueGold: '#b78b3e',
        ink: '#2b2528',
        inkSoft: '#4a3d42',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        soft: '0 18px 55px rgba(74, 40, 48, 0.10)',
        lux: '0 30px 70px -30px rgba(74, 40, 48, 0.35)',
        glow: '0 0 0 1px rgba(183, 110, 121, 0.12), 0 22px 60px -24px rgba(183, 110, 121, 0.45)',
      },
    },
  },
  plugins: [],
};
