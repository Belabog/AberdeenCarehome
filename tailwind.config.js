/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'velvet-green': '#163B2D',
        'evergreen-shadow': '#0F2B21',
        'moss-silk': '#5E7A6B',
        'sage-mist': '#C9D3CC',
        'warm-ivory': '#F6F2EA',
        'stone-taupe': '#B6ADA0',
        'soft-charcoal': '#2E312F',
        'antique-brass': '#A8844E',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
