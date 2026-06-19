/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        lg: '2rem',
      },
    },
    extend: {
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        midnight: {
          50: '#f5f5ff',
          100: '#e8e8ff',
          200: '#c4c6f0',
          300: '#8d8fd1',
          400: '#56589e',
          500: '#303272',
          600: '#1f2057',
          700: '#1a1b3a',
          800: '#12132a',
          900: '#0a0a18',
          950: '#06060f',
        },
        amber: {
          450: '#f59e0b',
        },
      },
      backgroundImage: {
        'noise-overlay': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        'hero-gradient': 'radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.25) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'glow-amber': '0 0 16px rgba(245, 158, 11, 0.35), 0 0 32px rgba(245, 158, 11, 0.15)',
        'glow-amber-strong': '0 0 24px rgba(245, 158, 11, 0.55), 0 0 48px rgba(245, 158, 11, 0.25)',
        'glow-purple': '0 0 16px rgba(99, 102, 241, 0.35), 0 0 32px rgba(99, 102, 241, 0.15)',
        'glow-purple-strong': '0 0 24px rgba(99, 102, 241, 0.55), 0 0 48px rgba(99, 102, 241, 0.25)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
