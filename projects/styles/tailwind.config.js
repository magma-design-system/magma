const palette = require('@maggioli-design-system/design-tokens').palette
const mediaQueries = require('@maggioli-design-system/design-tokens/dist/js/media').media
const fontFamily = require('@maggioli-design-system/design-tokens/dist/js/font-family').fontFamily

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
    fontFamily: {
      ...fontFamily,
    },
    screens: mediaQueries,
    extend: {
      fontSize: {
        'xxs': '0.625rem',
      },
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
        '9': '9rem',
        '10': '10rem',
        '11': '11rem',
        '12': '12rem',
      },
      minHeight: {
        '4': '400px',
        '5': '500px',
        '6': '600px',
        '7': '700px',
        '8': '800px',
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
  plugins: [
    require('tailwindcss-multi-column')(),
  ],
}
