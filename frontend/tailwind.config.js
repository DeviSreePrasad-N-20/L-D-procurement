/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F6F3',
        surface: '#FFFFFF',
        ink: '#171A21',
        muted: '#6B7080',
        border: '#E4E1DA',
        primary: {
          DEFAULT: '#2B3A67',
          light: '#3E5089',
          dark: '#1B2647',
        },
        accent: {
          DEFAULT: '#B7791F',
          light: '#D6A653',
        },
        status: {
          ok: '#2F6F4F',
          okBg: '#E9F3EE',
          warn: '#B7791F',
          warnBg: '#FBF1DF',
          critical: '#B23B3B',
          criticalBg: '#FBEAEA',
        },
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
