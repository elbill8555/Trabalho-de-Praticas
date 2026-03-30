import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-manrope)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#003f87',
          container: '#0056b3',
        },
        surface: {
          DEFAULT: '#f8f9fa',
          low: '#f3f4f5',
          high: '#e7e8e9',
          lowest: '#ffffff',
        },
      },
    },
  },
  plugins: [],
};

export default config;
