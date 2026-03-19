/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hotelGold: '#d4af37', // Añadimos el dorado de "Hotel Santiago"
      }
    },
  },
  plugins: [],
}
