/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
          600: '#475569',
        },
        brand: {
          teal: '#06B6D4',
          purple: '#7C3AED',
        },
        accent: {
          mint: '#5EF2C1',
          sky: '#7dd3fc',
        }
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #a855f7 0%, #14b8a6 50%, #ec4899 100%)',
        'radial-fade': 'radial-gradient(ellipse at top, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'brand': '0 20px 60px -12px rgba(168, 85, 247, 0.25), 0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon': '0 0 20px rgba(20, 184, 166, 0.5), 0 0 40px rgba(20, 184, 166, 0.2)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(168, 85, 247, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}

