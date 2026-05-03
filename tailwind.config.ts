import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "neo-border": "var(--neo-border)",
        "neo-muted": "var(--neo-muted)",
        "neo-accent": "var(--neo-accent)",
      },
      boxShadow: {
        "neo-neo": "6px 6px 0 0 var(--neo-shadow)",
      },
    },
  },
  plugins: [],
};
export default config;
