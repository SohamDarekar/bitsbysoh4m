/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#ded7fe',
          800: '#3b2f7e',
          900: '#2d2a4d',
        },
        surface: {
          light: '#ffffff',
          dark: '#1a1a1a',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#24242d',
            'h1, h2, h3, h4': {
              color: '#24242d',
            },
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}