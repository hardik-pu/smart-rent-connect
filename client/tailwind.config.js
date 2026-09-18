/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 14px 28px -6px rgba(15, 23, 42, 0.09), 0 6px 12px -3px rgba(15, 23, 42, 0.04)',
        'elevated': '0 10px 30px -10px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.02)',
        'btn-primary': '0 2px 4px 0 rgba(37, 99, 235, 0.18), 0 4px 12px -2px rgba(37, 99, 235, 0.25)',
        'btn-primary-hover': '0 4px 8px 0 rgba(37, 99, 235, 0.22), 0 8px 20px -2px rgba(37, 99, 235, 0.35)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.25)',
      },
    },
  },
  plugins: [],
};
