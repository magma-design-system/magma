const palette = require('@maggioli-design-system/design-tokens').palette
const mediaQueries = require('@maggioli-design-system/design-tokens/dist/js/media').media

module.exports = {
  important: true,
  mode: 'jit',
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
    screens: mediaQueries,
    extend: {
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
      },
      padding: {
        '1/1': '100%',
        '3/2': '66.67%',
        '4/3': '75%',
        '5/4': '80%',
        '16/9': '56.25%',
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['group-hover'],
      borderColor: ['group-hover'],
      margin: ['first', 'last'],
      textColor: ['group-hover'],
    },
  },
  plugins: [],
}
