/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      container: {
        center: true,
      },
    },
  },
  plugins: [
    require("flowbite/plugin"),
    ({ addUtilities }) => {
      addUtilities({
        ".align-icon": {
          "vertical-align": "-0.125em",
        },
      });
    },
  ],
};
