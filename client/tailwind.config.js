/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#e0eaff',
          200: '#c7d9ff',
          300: '#a5bfff',
          400: '#819cff',
          500: '#6574f7',
          600: '#4f56eb',
          700: '#3e42d4',
          800: '#2f37ac',
          900: '#1E3A8A',
        },
        accent: {
          50: '#edfcf9',
          100: '#d6f9f1',
          200: '#b0f2e4',
          300: '#7de8d1',
          400: '#48d4b7',
          500: '#2cb9a0',
          600: '#219484',
          700: '#1d766c',
          800: '#1c5e57',
          900: '#1a4d49',
        },
      },
      animation: {
        'flip': 'flip 0.6s ease-in-out',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#4f56eb",
          "secondary": "#2cb9a0",
          "accent": "#f97316",
          "neutral": "#2a323c",
          "base-100": "#ffffff",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
        dark: {
          "primary": "#6574f7",
          "secondary": "#48d4b7",
          "accent": "#f97316",
          "neutral": "#191D24",
          "base-100": "#1f2937",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
    ],
  },
};