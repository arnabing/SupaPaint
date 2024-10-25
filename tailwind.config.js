const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00ff00', // Define your primary green color
        secondary: '#ffffff', // Define your secondary color (white in this case)
        background: '#000000', // Define your background color (black)
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
