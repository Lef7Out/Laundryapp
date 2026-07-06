import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        paper: "#FFFFFF",
        suds: {
          DEFAULT: "#3454D1",
          dark: "#28409E",
          light: "#5D78E0",
        },
        sky: "#EAF1FF",
        line: "#E4E7EC",
        marigold: "#F5A524",
        whatsapp: "#25D366",
        "whatsapp-dark": "#1DA851",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-utility)"],
      },
      borderRadius: {
        card: "1.25rem",
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(16, 24, 40, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
