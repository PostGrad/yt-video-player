/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', "monospace"],
        sans: ['"JetBrains Mono"', "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
