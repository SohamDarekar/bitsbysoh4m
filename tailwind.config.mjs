/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
        text: {
          light: '#24242d', // Added specific text color for light mode
          dark: '#ffffff',  // Added specific text color for dark mode
        },
      },
      typography: {
        light: {
          css: {
            maxWidth: '85ch', // Increased from 65ch
            color: 'var(--tw-prose-body)',
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
              fontWeight: '700',
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
              height: 'auto',maxWidth: '85ch'
            },
            hr: {
              borderColor: '#000000',
              borderWidth: '2px',  
              borderStyle: 'solid',  
            },
          },
        },
        dark: {
          css: {
            maxWidth: '85ch',
            color: '#ffffff',
            '[class~="lead"]': {
              color: '#ffffff',
            },
            a: {
              color: '#a5b4fc',
              '&:hover': {
                color: '#818cf8',
              },
            },
            strong: {
              color: '#ffffff',
              fontWeight: '800',
              textShadow: '0 0 1px rgba(255, 255, 255, 0.5)',
            },
            blockquote: {
              color: '#ffffff',
              borderLeftColor: '#4b5563',
            },
            'h1, h2, h3, h4': {
              color: '#ffffff',
              fontWeight: '600',
            },
            'ul, ol': {
              color: '#ffffff',
            },
            li: {
              color: '#ffffff',
            },
            p: {
              color: '#ffffff',
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
              color: '#ffffff',
            },
            'ul > li::marker': {
              color: '#d1d5db',
            },
            'tbody td, thead th': {
              color: '#ffffff',
            },
            b: {
              color: '#ffffff',
              fontWeight: '800',
              textShadow: '0 0 1px rgba(255, 255, 255, 0.5)',
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