/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Obsidian / Luxury Theme
        obsidian: {
          950: '#050505',
          900: '#0A0A0A',
          800: '#121212',
          700: '#1C1C1C',
          600: '#262626',
        },
        gold: {
          DEFAULT: '#D4AF37',
          50: '#FDFBF4',
          100: '#FAF4DC',
          200: '#F3E5AF',
          300: '#EBD27C',
          400: '#E2BD4A',
          500: '#D4AF37',
          600: '#B89324',
          700: '#91721A',
          800: '#6C5314',
          900: '#4A370C',
        },
        // Cyberpunk / Neon Theme
        cyber: {
          dark: '#0B0B12',
          violet: '#8B5CF6',
          fuchsia: '#D946EF',
          cyan: '#06B6D4',
          green: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'Satoshi', 'ui-sans-serif', 'system-ui'],
        display: ['Syne', 'Space Grotesk', 'Outfit', 'Clash Display', 'sans-serif'],
        serif: ['Playfair Display', 'ui-serif', 'Georgia'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-down': 'fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'reveal-text': 'revealText 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        revealText: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
