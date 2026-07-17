import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        emerald: {
          50: '#ecfdf5',
          500: '#10b981', // Primary Emerald
          900: '#064e3b',
        },
        gold: {
          300: '#fcd34d',
          400: '#fbbf24', // Accent Gold
          500: '#f59e0b',
        },
        champagne: '#F7E7CE',
        ivory: '#FFFFF0',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config