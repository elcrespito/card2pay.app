import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#08080b",
          900: "#0d0d12",
          850: "#13131a",
          800: "#1a1a23",
          700: "#23232f",
          600: "#2e2e3c",
        },
        gold: {
          DEFAULT: "#d69e2e",
          300: "#e9c46a",
          400: "#dDB04a",
          500: "#d69e2e",
          600: "#b9842b",
          700: "#a6741f",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
