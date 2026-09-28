/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff9f4",
          100: "#d7f0e2",
          200: "#aee0c6",
          300: "#7cc9a5",
          400: "#4aab80",
          500: "#2c8f65",
          600: "#1f7251",
          700: "#1a5b42",
          800: "#174935",
          900: "#143c2c"
        },
        accent: {
          500: "#e0912b",
          600: "#c4761b"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      maxWidth: {
        app: "480px"
      }
    }
  },
  plugins: []
};
