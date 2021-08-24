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
        'sharp-lg': '0 0 1px 1px rgba(0, 0, 0, 0.06), 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'sharp-md': '0 0 1px 1px rgba(0, 0, 0, 0.06), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        sharp: '0 0 1px 1px rgba(0, 0, 0, 0.06), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'sharp-sm': '0 0 1px 1px rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      fontSize: {
        xxs: '0.625rem',
      },
      gridTemplateColumns: {
        'fit-sm': 'repeat(auto-fit, minmax(10rem, 1fr))',
        fit: 'repeat(auto-fit, minmax(12.5rem, 1fr))',
        'fit-md': 'repeat(auto-fit, minmax(15rem, 1fr))',
        'fit-lg': 'repeat(auto-fit, minmax(17.5rem, 1fr))',
        'fit-xl': 'repeat(auto-fit, minmax(20rem, 1fr))',
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
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        7: '1.75rem',
        8: '2rem',
        9: '2.25rem',
        10: '2.5rem',
        11: '2.75rem',
        12: '3rem',
        14: '3.5rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        28: '7rem',
        32: '8rem',
        36: '9rem',
        40: '10rem',
        44: '11rem',
        48: '12rem',
        52: '13rem',
        56: '14rem',
        60: '15rem',
        64: '16rem',
        72: '18rem',
        80: '20rem',
        96: '24rem',
        400: '400px',
        500: '500px',
        600: '600px',
        700: '700px',
        800: '800px',
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
        cosmetic: 'background-color, border-color, box-shadow, color, height, margin, opacity, padding, transform, width',
        size: 'height, margin, padding, width',
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
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-scroll-snap'),
    require('tailwindcss-multi-column')(),
  ],
}
