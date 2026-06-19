import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'Inter', ...fontFamily.sans],
        display: ['Cal Sans', 'Inter var', ...fontFamily.sans],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          400: '#26c6da',
          500: '#00bcd4',
          600: '#0097a7',
        },

        success: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },

        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          50: '#f0f4f8',
          100: '#d6e4f0',
          200: '#b9cfe3',
          300: '#90b4d2',
          400: '#5d90ba',
          500: '#0b192c',
          600: '#081322',
          700: '#060e18',
          800: '#040910',
          900: '#020508',
        },
        energy: {
          400: '#feba74',
          500: '#f5a623',
          600: '#d97706',
        },
        tertiary: {
          DEFAULT: '#00bcd4',
          50: '#e0f7fa',
          500: '#00bcd4',
          600: '#00acc1',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0b192c 0%, #00bcd4 100%)',
        'gradient-energy': 'linear-gradient(135deg, #ff9100 0%, #00bcd4 100%)',
        'gradient-success': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'gradient-card': 'linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)',
      },
      boxShadow: {
        'brand-sm': '0 2px 8px rgba(0,188,212,0.15)',
        'brand-md': '0 4px 20px rgba(0,188,212,0.25)',
        'brand-lg': '0 8px 40px rgba(0,188,212,0.35)',
        'card': '0 12px 25px -4px rgba(11, 25, 44, 0.09), 0 4px 12px -2px rgba(11, 25, 44, 0.05), 0 0 1px 0 rgba(11, 25, 44, 0.12)',
        'card-hover': '0 20px 35px -8px rgba(11, 25, 44, 0.16), 0 8px 20px -6px rgba(0, 188, 212, 0.15), 0 0 1px 0 rgba(11, 25, 44, 0.2)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-brand': 'pulse-brand 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-brand': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};