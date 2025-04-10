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
            '[class~="lead"]': {
              color: '#4b5563',
            },
            a: {
              color: '#3b2f7e',
              '&:hover': {
                color: '#2d2a4d',
              },
            },
            strong: {
              color: '#24242d',
            },
            blockquote: {
              color: '#4b5563',
            },
            'h1, h2, h3, h4': {
              color: '#24242d',
              overflowWrap: 'break-word',
              hyphens: 'auto',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
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
        dark: {
          css: {
            color: '#f3f4f6', // Much lighter gray, almost white for better readability
            '[class~="lead"]': {
              color: '#f3f4f6',
            },
            a: {
              color: '#a5b4fc',
              '&:hover': {
                color: '#818cf8',
              },
            },
            strong: {
              color: '#ffffff',
            },
            blockquote: {
              color: '#e5e7eb',
              borderLeftColor: '#4b5563',
            },
            'h1, h2, h3, h4': {
              color: '#ffffff',
            },
            'ul, ol': {
              color: '#f3f4f6',
            },
            li: {
              color: '#f3f4f6',
            },
            p: {
              color: '#f3f4f6',
            },
            code: {
              color: '#e5e7eb',
            },
            'pre code': {
              color: '#e5e7eb',
              backgroundColor: 'transparent',
            },
            hr: {
              borderColor: '#4b5563',
            },
            'ol > li::marker': {
              color: '#d1d5db',
            },
            'ul > li::marker': {
              color: '#d1d5db',
            },
            'tbody td, thead th': {
              color: '#f3f4f6',
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