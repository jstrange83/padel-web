import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",  // sørger for at tailwind scanner alle dine sider
    "./components/**/*.{js,ts,jsx,tsx}", // hvis du senere laver en components-mappe
  ],
  theme: {
    extend: {
      colors: {
        padelblue: "#1a73e8", // blå farve vi bruger til knapper
        padelgray: "#f5f5f5", // lys grå baggrund
      },
    },
  },
  plugins: [],
};

export default config;
