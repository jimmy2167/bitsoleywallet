/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8E2DE2",
        secondary: "#4A00E0",
        luxe: "#C5B358",
      },
      boxShadow: {
        glow: "0 0 40px rgba(142,45,226,0.45)",
        card: "0 8px 40px rgba(0,0,0,0.45)"
      },
      backdropBlur: {
        xs: "2px"
      },
    },
  },
  plugins: [],
}
