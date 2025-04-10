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
              overflowWrap: 'break-word',
              hyphens: 'auto',
            },
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            },
            pre: {
              overflowX: 'auto',
              maxWidth: '100vw',
            },
            img: {
              maxWidth: '100%',
              height: 'auto',
            },
          },
        },
      },
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}