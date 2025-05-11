/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      container: {
        center: true,
        padding : "2rem"
      },
      colors : {
        "primaryColor" : "#DB3F40",
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Replace with your Google Font name
      },
    },
  },
  plugins: [],
};
