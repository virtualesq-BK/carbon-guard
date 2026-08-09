import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0faf6",
          100: "#dcf3e8",
          400: "#3cb887",
          500: "#1f9d6e",
          600: "#16825a",
          700: "#12684a",
          900: "#0d3f30",
        },
      },
    },
  },
  plugins: [],
};

export default config;
