const palette = require('@maggioli-design-system/design-tokens').palette

module.exports = {
  important: true,
  purge: {
    mode: 'all',
    content: [
      './src/**/*.{js,jsx}'
    ],
    variables: true,
    options: {
      keyframes: true,
    },
  },
  darkMode: 'media',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      ...palette,
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      xxl: '1536px',
      xxxl: '1800px',
    },
    extend: {},
    maxWidth: {
      '1/4': '25%',
      '1/2': '50%',
      '3/4': '75%',
      '1': '1rem',
      '2': '2rem',
      '3': '3rem',
      '4': '4rem',
      '5': '5rem',
      '6': '6rem',
      '7': '7rem',
      '8': '8rem',
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
