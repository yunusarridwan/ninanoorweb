import flowbite from "flowbite-react/tailwind"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      colors: {
        primary: "#f9f9f9",
        primaryLight: "#e3f7fa",
        secondary: "#ff8b06",
        tertiary: "#404040",
        gray: {
          10: "#EEEEEE",
          20: "#A2A2A2",
          30: "#7B7B7B",
          50: "#585858",
          90: "#141414",
        },
      },
      screens: {
        xs: "400px",
        "3xl": "1680px",
        "4xl": "2200px",
      },
      backgroundImage: {
        hero: "url(/src/assets/bg.jpg)",
        pattern: "url(/src/assets/pattern.png)",
      },
    },
  },
  plugins: [
    flowbite.plugin()

  ],
}

