/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      colors: {
        brand: {
          50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',
          500:'#6366f1',600:'#4f46e5',700:'#4338ca',800:'#3730a3',900:'#312e81',
        },
      },
      boxShadow: {
        soft: '0 12px 40px rgba(2, 6, 23, 0.10)',
        card: '0 8px 24px rgba(2, 6, 23, 0.08)',
        glow: '0 0 40px -10px rgba(99, 102, 241, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        inter: ['Inter','ui-sans-serif','system-ui','-apple-system','Segoe UI','Roboto','Arial','sans-serif'],
      },
      borderRadius: { xl: '1rem', '2xl': '1.25rem' },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'toast-in': 'toast-in 0.25s ease-out forwards',
      },
    },
  },
  plugins: [],
};
