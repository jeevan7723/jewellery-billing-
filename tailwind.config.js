/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#040508',
          900: '#07080D',
          850: '#0B0D14',
          800: '#10141F',
          750: '#161B29',
          700: '#1E2538',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-gold': 'rgba(212, 175, 55, 0.25)',
        },
        gold: {
          50: '#FCF9EE',
          100: '#F9F1D5',
          200: '#F2DF9F',
          300: '#ECCB68',
          400: '#E5B83B',
          500: '#D4AF37', // Imperial Gold
          600: '#B8860B', // Dark Goldenrod
          700: '#946608',
          800: '#6B4706',
          900: '#422B04',
        },
        champagne: {
          light: '#FFF8E7',
          DEFAULT: '#F7E7CE',
          shimmer: '#EED9B3',
        },
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.12)',
        'glass-lg': '0 20px 50px 0 rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.18)',
        'gold-glow': '0 0 35px -5px rgba(212, 175, 55, 0.35)',
        'gold-glow-lg': '0 0 60px -10px rgba(212, 175, 55, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(212, 175, 55, 0.15)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'tilt-wobble': 'tilt 10s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      }
    },
  },
  plugins: [],
}
