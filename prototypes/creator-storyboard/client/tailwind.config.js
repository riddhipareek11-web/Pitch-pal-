/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#211D17',
        paper: '#FAF7F0',
        card: '#FFFFFF',
        rust: '#C1502E',
        rustDark: '#A23F22',
        teal: '#1F6F63',
      },
      fontFamily: {
        display: ['"Iowan Old Style"', 'Georgia', 'ui-serif', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(33, 29, 23, 0.06), 0 1px 8px rgba(33, 29, 23, 0.05)',
      },
    },
  },
  plugins: [],
}
