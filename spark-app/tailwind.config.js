/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#326273",
        secondary: "#5C9EAD",
        accent: "#E39774",
        dark: "#373535",
        light: "#FFFFFF"
      }
    },
  },
  plugins: [],
}