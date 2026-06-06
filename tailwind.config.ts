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
        // Primary - Logo Gold (from actual logo)
        gold: {
          50: '#fefce8',
          100: '#f9f3e3',
          200: '#f0e5c8',
          300: '#e4d5a8',
          400: '#d4c589',  // Logo gold highlight
          500: '#c9a961',  // Main logo gold
          600: '#b8954d',  // Logo gold mid
          700: '#8f7339',  // Logo gold dark
          800: '#6b5528',
          900: '#4a3918',
        },
        // Secondary - Logo Forest Green (from actual logo)
        forest: {
          50: '#f0f7f2',
          100: '#d9ebe0',
          200: '#b3d7c1',
          300: '#7db896',
          400: '#4a9368',
          500: '#2c4a34',  // Main logo green
          600: '#23392a',  // Logo green mid
          700: '#1a2b20',  // Logo green dark
          800: '#131f18',
          900: '#0d1510',
        },
        // Accent - Warm Earth Tones (complement logo)
        warmGold: {
          50: '#fdf9f3',
          100: '#f7ede1',
          200: '#ead9c3',
          300: '#dbc39d',
          400: '#c9a961',  // Matches logo gold
          500: '#b8954d',
          600: '#9d7d3e',
          700: '#7d6230',
          800: '#5e4a24',
          900: '#3f3119',
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
        // Based on logo ribbon colors
        'logo-gradient': 'linear-gradient(135deg, #2c4a34 0%, #4a9368 30%, #b8954d 70%, #c9a961 100%)',
        'gold-gradient': 'linear-gradient(135deg, #2c4a34 0%, #4a9368 40%, #b8954d 70%, #c9a961 100%)',
        'green-gold': 'linear-gradient(135deg, #2c4a34 0%, #23392a 25%, #4a9368 50%, #b8954d 75%, #c9a961 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0d1510 0%, #2c4a34 50%, #0d1510 100%)',
        'warm-gradient': 'linear-gradient(135deg, #2c4a34 0%, #c9a961 100%)',
        'hero-text': 'linear-gradient(135deg, #2c4a34 0%, #4a9368 30%, #7db896 50%, #b8954d 75%, #c9a961 100%)',
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
