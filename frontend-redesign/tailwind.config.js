/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#14202B', soft: '#2B3A48' }, // petrol navy: text and dark surfaces
        paper: '#F5F7F8', // page background
        chrome: '#E6EBEE', // quiet fills, hover states
        line: '#D3DBE0', // borders and dividers
        steel: '#566673', // secondary text
        signal: { DEFAULT: '#F2C200', deep: '#D4A900' }, // road-marking yellow: the one accent
        ok: '#1B7F53',
        bad: '#B3302F',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif'],
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
