const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, './pages/**/*.{js,ts,jsx,tsx}'),
    path.join(__dirname, './components/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        main: {
          100: 'hsl(199deg 100% 90%)',
          200: 'hsl(199deg 100% 80%)',
          300: 'hsl(199deg 100% 70%)',
          400: 'hsl(199deg 100% 60%)',
          500: 'hsl(199deg 100% 50%)',
          600: 'hsl(199deg 100% 40%)',
          700: 'hsl(199deg 100% 30%)',
          800: 'hsl(199deg 100% 20%)',
          900: 'hsl(199deg 100% 10%)'
        }
      }
    }
  },
  plugins: [],
}
