import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary - Elegant Gold
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#d4af37',  // Main Gold
          500: '#b8860b',  // Deep Gold
          600: '#92690a',
          700: '#6b4e08',
          800: '#453306',
          900: '#1f1803',
        },
        // Secondary - Deep Forest Green
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#1a3320',  // Deep Green
          600: '#0f1a12',  // Darker Green
          700: '#0a1109',
          800: '#050805',
          900: '#020402',
        },
        // Accent - Soft Champagne
        champagne: {
          50: '#fef7ee',
          100: '#fdecd6',
          200: '#fbd5a8',
          300: '#f7b96f',
          400: '#f39a47',
          500: '#c9952d',  // Champagne Gold
          600: '#a77823',
          700: '#85591c',
          800: '#644115',
          900: '#3d280e',
        },
        // Keep rose for backward compatibility
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #b8860b 0%, #d4af37 45%, #c9952d 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0f1a12 0%, #1a3320 50%, #0f1a12 100%)',
        'champagne-gradient': 'linear-gradient(135deg, #c9952d 0%, #d4af37 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'petal-fall': 'petalFall 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        petalFall: {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
