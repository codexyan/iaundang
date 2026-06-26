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
        sans: ['var(--font-geist-sans)', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        graphite: '#0a0a0a',
        'pure-black': '#000000',
        carbon: '#171717',
        concrete: '#737373',
        ash: '#a1a1a1',
        smoke: '#b9b9b9',
        hairline: '#e5e5e5',
        mist: '#f2f2f2',
        chalk: '#ffffff',
      },
      borderRadius: {
        'nav': '10px',
        'card': '14px',
        'pill': '9999px',
        'badge': '26px',
        'input': '10px',
        'button': '10px',
      },
      spacing: {
        '18': '4.5rem',
        '83': '83px',
      },
      maxWidth: {
        'page': '1200px',
      },
      fontSize: {
        'caption': ['12px', { lineHeight: '1.5' }],
        'body': ['14px', { lineHeight: '1.43' }],
        'subheading': ['18px', { lineHeight: '1.5', letterSpacing: '-0.45px' }],
        'display': ['48px', { lineHeight: '1.1', letterSpacing: '-2.4px' }],
      },
      boxShadow: {
        'subtle': '0px 0px 0px 2px #ffffff',
        'subtle-2': '0px 0px 0px 1px rgba(10, 10, 10, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
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
      },
    },
  },
  plugins: [],
}

export default config
