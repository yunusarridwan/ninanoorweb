import flowbite from "flowbite-react/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(), // Keep it here for content purging
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          "50": "#fff7ed",
          "100": "#ffedd5",
          "200": "#fed7aa",
          "300": "#fdba74",
          "400": "#fb923c",
          "500": "#f97316",
          "600": "#ea580c",
          "700": "#c2410c",
          "800": "#9a3412",
          "900": "#7c2d12",
          "950": "#431407",
        }
      },
      fontFamily: {
        body: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
    },
  },
  // Add the safelist here to explicitly include dynamic classes
  safelist: [
    // Background colors with opacity for light theme
    'bg-yellow-500/20',
    'bg-green-500/20',
    'bg-blue-500/20',
    'bg-indigo-500/20',
    'bg-gray-500/20',
    'bg-red-500/20',
    // Text colors for light theme
    'text-yellow-500',
    'text-green-500',
    'text-blue-500', // Already present from default, but good to be explicit
    'text-indigo-500',
    'text-gray-500',
    'text-red-500',
    // Background colors with opacity for dark theme (if you have dark variants for these)
    // Note: Tailwind typically generates dark variants if the base color is used.
    // If your theme uses different shades for dark mode, adjust these accordingly.
    'dark:bg-yellow-600/20', // Example dark theme background
    'dark:text-yellow-600',  // Example dark theme text
    'dark:bg-green-600/20',
    'dark:text-green-600',
    'dark:bg-blue-600/20',
    'dark:text-blue-600',
    'dark:bg-indigo-600/20',
    'dark:text-indigo-600',
    'dark:bg-gray-600/20',
    'dark:text-gray-600',
    'dark:bg-red-600/20',
    'dark:text-red-600',
  ],
  plugins: [
    // flowbite.content(), // Remove duplicate from here
    flowbite.plugin(), // Use flowbite.plugin() for Flowbite's JS components
  ],
};