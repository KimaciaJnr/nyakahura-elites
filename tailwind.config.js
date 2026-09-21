/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#102A43",
          light: "#1F4E79",
          dark: "#071A2B",
        },
        gold: {
          DEFAULT: "#D4A72C",
          dark: "#A87E16",
        },
        green: {
          DEFAULT: "#2F7D4A",
          dark: "#205B35",
        },
        cream: "#F7F2E9",
        sand: "#FBF8F3",
        ink: "#1A1A1A",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};