import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'liga-blue': '#003893',
        'liga-dark': '#001F4E',
        'liga-yellow': '#FFD100',
        'liga-gold': '#FFE566',
        'liga-red': '#E30613',
        'liga-light': '#F5F6FA',
        'liga-white': '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
