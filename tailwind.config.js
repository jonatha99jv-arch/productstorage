/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'company-dark-blue': '#1e3a8a',
        'company-orange': '#f97316',
        'company-red-orange': '#ea580c',
      },
    },
  },
  plugins: [],
}
