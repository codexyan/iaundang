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
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', "'Playfair Display'", 'Georgia', 'serif'],
      },
      colors: {
        // Primary - Smooth Gold Palette (refined & elegant)
        gold: {
          50: '#fefdf8',   // Almost white with warm tint
          100: '#faf6ed',  // Very light cream-gold
          200: '#f4eddc',  // Light warm cream
          300: '#e8dcc4',  // Soft gold-cream
          400: '#d9c89a',  // Light gold
          500: '#c9a961',  // Main logo gold ⭐
          600: '#b8954d',  // Rich gold
          700: '#9a7d3f',  // Deep gold
          800: '#7a6332',  // Bronze-gold
          900: '#5a4825',  // Dark bronze
        },
        // Secondary - Smooth Forest Green (refined & elegant)
        forest: {
          50: '#f7faf8',   // Almost white with green tint
          100: '#e8f2ec',  // Very light mint-green
          200: '#d1e4d9',  // Light sage
          300: '#a8cbb8',  // Soft green
          400: '#6fa88a',  // Mid green
          500: '#2c4a34',  // Main logo green ⭐
          600: '#23392a',  // Deep forest
          700: '#1c2e22',  // Darker forest
          800: '#15231a',  // Very dark green
          900: '#0f1a14',  // Near black green
        },
        // Accent - Smooth Warm Tones (harmonious)
        warmGold: {
          50: '#fdfbf7',   // Warm white
          100: '#f9f3e8',  // Ivory
          200: '#f0e5d0',  // Cream
          300: '#e4d3b3',  // Light tan
          400: '#d4bc8e',  // Warm sand
          500: '#c9a961',  // Matches main gold
          600: '#b38f4f',  // Rich warm gold
          700: '#957540',  // Deep warm gold
          800: '#755b32',  // Brown-gold
          900: '#564226',  // Dark brown-gold
        },
        // NEW: Smooth Sage (elegant neutral green-gray)
        sage: {
          50: '#f8faf9',   // Pale sage
          100: '#ecf1ee',  // Very light sage
          200: '#dae3dd',  // Light sage-gray
          300: '#b8c9bf',  // Soft sage
          400: '#8fa99a',  // Mid sage
          500: '#5d7a6a',  // Sage green
          600: '#4a6355',  // Deep sage
          700: '#3a4e44',  // Dark sage
          800: '#2d3d35',  // Very dark sage
          900: '#232f29',  // Near black sage
        },
        // Keep rose for compatibility
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
        // Smooth elegant gradients (refined transitions)
        'logo-gradient': 'linear-gradient(135deg, #2c4a34 0%, #4a6355 20%, #6fa88a 40%, #b8954d 70%, #c9a961 100%)',
        'gold-gradient': 'linear-gradient(135deg, #2c4a34 0%, #3a4e44 15%, #5d7a6a 35%, #8fa99a 55%, #b8954d 75%, #c9a961 100%)',
        'green-gold': 'linear-gradient(135deg, #1c2e22 0%, #2c4a34 20%, #4a6355 40%, #6fa88a 60%, #b8954d 80%, #c9a961 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0f1a14 0%, #15231a 20%, #2c4a34 50%, #15231a 80%, #0f1a14 100%)',
        'warm-gradient': 'linear-gradient(135deg, #2c4a34 0%, #4a6355 25%, #8fa99a 50%, #c9a961 100%)',
        'hero-text': 'linear-gradient(135deg, #2c4a34 0%, #3a4e44 15%, #5d7a6a 30%, #8fa99a 50%, #b8954d 75%, #c9a961 100%)',
        'elegant-cream': 'linear-gradient(135deg, #fefdf8 0%, #faf6ed 50%, #f4eddc 100%)',
        'soft-sage': 'linear-gradient(135deg, #f8faf9 0%, #ecf1ee 50%, #dae3dd 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'petal-fall': 'petalFall 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gentle-float': 'gentleFloat 3s ease-in-out infinite',
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
        gentleFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
