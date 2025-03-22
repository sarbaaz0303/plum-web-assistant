/** @type {import('tailwindcss').Config} */
export default {
 content: ["src/**/*.{html,js,ts,jsx,tsx}"],
 theme: {
  extend: {
   fontFamily: {
    header: ['"Roboto"', "sans-serif"],
    body: ['"Merriweather"', "serif"],
   },
  },
 },
 plugins: [], 
};
