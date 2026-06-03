/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        heading: ['var(--font-poppins)', ...fontFamily.sans],
        spiritual: ['var(--font-heading)', ...fontFamily.serif],
      },
      colors: {
        background: '#F5F7F2', // Himalayan Snow
        foreground: '#1E293B', // Dark Slate
        primary: {
          DEFAULT: '#1B4D2E', // Pine Green
          foreground: '#F5F7F2',
        },
        accent: {
          DEFAULT: '#FF8C42', // Sacred Saffron
          foreground: '#1E293B',
        },
        muted: {
          DEFAULT: '#E8EDE4', // Mountain Mist
          foreground: '#4A5568',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1E293B',
        },
        border: '#8B5A2B', // Earthy Brown (used subtly)
      },
      borderRadius: {
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        'apple': '0 4px 20px -5px rgba(0, 0, 0, 0.05)',
        'apple-deep': '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
};