/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#14213d',
        'ink-soft': '#44506b',
        paper: '#f2f4f7',
        surface: '#ffffff',
        line: '#d8dde5',
        teal: {
          DEFAULT: '#0b7a75',
          dark: '#085d59',
          tint: '#d7ecea',
        },
        amber: '#935f0b',
        rose: '#b42343',
        moss: '#2f7d4f',
        slate: '#5d6882',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
