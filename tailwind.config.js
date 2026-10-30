/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        auth: {
          bg: '#030C1B',
          surface: '#111E32',
          pressed: '#182942',
          border: '#263A55',
          primary: '#3B82F6',
          text: '#FFFFFF',
          muted: '#91BCE4',
          placeholder: '#6888A8',
          danger: '#F87171',
          success: '#4ADE80',
        },
      },
    },
  },
  plugins: [],
};
