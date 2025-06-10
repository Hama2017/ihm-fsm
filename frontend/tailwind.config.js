/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Couleurs personnalisables via CSS variables
          primary: {
            50: 'rgb(var(--color-primary-50, 239 246 255) / <alpha-value>)',
            100: 'rgb(var(--color-primary-100, 219 234 254) / <alpha-value>)',
            200: 'rgb(var(--color-primary-200, 191 219 254) / <alpha-value>)',
            300: 'rgb(var(--color-primary-300, 147 197 253) / <alpha-value>)',
            400: 'rgb(var(--color-primary-400, 96 165 250) / <alpha-value>)',
            500: 'rgb(var(--color-primary-500, 59 130 246) / <alpha-value>)',
            600: 'rgb(var(--color-primary-600, 37 99 235) / <alpha-value>)',
            700: 'rgb(var(--color-primary-700, 29 78 216) / <alpha-value>)',
            800: 'rgb(var(--color-primary-800, 30 64 175) / <alpha-value>)',
            900: 'rgb(var(--color-primary-900, 30 58 138) / <alpha-value>)',
          },
        },
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }