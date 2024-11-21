/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class', // Habilita el modo oscuro basado en clases
  theme: {
    extend: {
      colors: {
        // Puedes añadir colores personalizados aquí si lo necesitas
      },
    },
  },
  plugins: [],
}
