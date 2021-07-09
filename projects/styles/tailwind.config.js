const { palette } = require('@maggioli-design-system/design-tokens')
const mediaQueries = require('@maggioli-design-system/design-tokens/dist/js/media').media
const { fontFamily } = require('@maggioli-design-system/design-tokens/dist/js/font-family')
const { ease } = require('@maggioli-design-system/design-tokens/dist/js/ease')

module.exports = {
  important: true,
  mode: 'jit',
  purge: {
    mode: 'all',
    content: [
      './src/**/*.{js,jsx}',
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
      inherit: 'inherit',
      ...palette,
    },
    fontFamily: {
      ...fontFamily,
    },
    screens: mediaQueries,
    transitionTimingFunction: {
      ...ease,
    },
    extend: {
      boxShadow: {
        sharp: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 0 1px 1px rgba(0, 0, 0, 0.06)',
        'lg-sharp': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 0 1px 1px rgba(0, 0, 0, 0.06), 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      fontSize: {
        xxs: '0.625rem',
      },
      maxWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        1: '1rem',
        2: '2rem',
        3: '3rem',
        4: '4rem',
        5: '5rem',
        6: '6rem',
        7: '7rem',
        8: '8rem',
        9: '9rem',
        10: '10rem',
        11: '11rem',
        12: '12rem',
        phrase: '50ch',
        text: '75ch',
        title: '30ch',
      },
      minHeight: {
        4: '400px',
        5: '500px',
        6: '600px',
        7: '700px',
        8: '800px',
      },
      padding: {
        '1/1': '100%',
        '3/2': '66.67%',
        '4/3': '75%',
        '5/4': '80%',
        '16/9': '56.25%',
      },
      overflow: {
        inherit: 'inherit',
      },
      textOverflow: {
        inherit: 'inherit',
      },
      transitionProperty : {
        input: 'background-color, border-color, box-shadow, color, padding',
        size: 'width, height, padding, margin',
      },
      width: {
        phrase: '50ch',
        text: '75ch',
        title: '30ch',
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
