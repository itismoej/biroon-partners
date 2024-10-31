import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        't-sm': '0 -1px 2px 0 rgba(0, 0, 0, 0.05)',
        't-md': '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        't-lg': '0 -10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        't-xl': '0 -20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        't-2xl': '0 -25px 50px -12px rgba(0, 0, 0, 0.25)',
        't-3xl': '0 -35px 60px -15px rgba(0, 0, 0, 0.3)',
        'b-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'b-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)',
        'b-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 -4px 6px -2px rgba(0, 0, 0, 0.05)',
        'b-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 -10px 10px -5px rgba(0, 0, 0, 0.04)',
        'b-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'b-3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
        'l-sm': '-1px 0 2px 0 rgba(0, 0, 0, 0.05)',
        'l-md': '-4px 0 6px -1px rgba(0, 0, 0, 0.1), 2px 0 4px -1px rgba(0, 0, 0, 0.06)',
        'l-lg': '-10px 0 15px -3px rgba(0, 0, 0, 0.1), 4px 0 6px -2px rgba(0, 0, 0, 0.05)',
        'l-xl': '-20px 0 25px -5px rgba(0, 0, 0, 0.1), 10px 0 10px -5px rgba(0, 0, 0, 0.04)',
        'l-2xl': '-25px 0 50px -12px rgba(0, 0, 0, 0.25)',
        'l-3xl': '-35px 0 60px -15px rgba(0, 0, 0, 0.3)',
        'r-sm': '1px 0 2px 0 rgba(0, 0, 0, 0.05)',
        'r-md': '4px 0 6px -1px rgba(0, 0, 0, 0.1), -2px 0 4px -1px rgba(0, 0, 0, 0.06)',
        'r-lg': '10px 0 15px -3px rgba(0, 0, 0, 0.1), -4px 0 6px -2px rgba(0, 0, 0, 0.05)',
        'r-xl': '20px 0 25px -5px rgba(0, 0, 0, 0.1), -10px 0 10px -5px rgba(0, 0, 0, 0.04)',
        'r-2xl': '25px 0 50px -12px rgba(0, 0, 0, 0.25)',
        'r-3xl': '35px 0 60px -15px rgba(0, 0, 0, 0.3)',
        'all-sm': '0 0 2px 0 rgba(0, 0, 0, 0.05)',
        'all-md': '0 0 6px -1px rgba(0, 0, 0, 0.1), 0 0 4px -1px rgba(0, 0, 0, 0.06)',
        'all-lg': '0 0 15px -3px rgba(0, 0, 0, 0.1), 0 0 6px -2px rgba(0, 0, 0, 0.05)',
        'all-xl': '0 0 25px -5px rgba(0, 0, 0, 0.1), 0 0 10px -5px rgba(0, 0, 0, 0.04)',
        'all-2xl': '0 0 50px -12px rgba(0, 0, 0, 0.25)',
        'all-3xl': '0 0 60px -15px rgba(0, 0, 0, 0.3)'
      },
      keyframes: {
        slideInTop: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideOutTop: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        slideInBottom: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideOutBottom: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        lightPulse: {
          '0%': { opacity: "1" },
          '50%': { opacity: ".7" },
          '100%': { opacity: "1" },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        slideInTop: 'slideInTop 0.5s ease-out',
        slideOutTop: 'slideOutTop 0.5s ease-out',
        slideInBottom: 'slideInBottom 0.5s ease-out',
        slideOutBottom: 'slideOutBottom 0.5s ease-out',
        lightPulse: 'lightPulse 2s ease-out infinite',
        fadeInUp: 'fadeInUp 0.1s ease-out forwards',
      },
    },
  },
  plugins: [],
};
export default config;
