/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('tailwindcss').Config} */

const { palette } = require('@maggioli-design-system/design-tokens')
const { fontFamily } = require('@maggioli-design-system/design-tokens/dist/js/tailwind-font-family.js')
const fontSizeMagma = require('@maggioli-design-system/design-tokens/dist/js/tailwind-font-size.js').fontSize
const {
  aspectRatio,
  border,
  borderRadius,
  boxShadow,
  fontSize,
  gap,
  gridTemplateColumns,
  margin,
  padding,
  size,
  timingFunction,
  transitionProperty,
} = require('@maggioli-design-system/design-tokens/dist/js/tailwind-props.js').properties

const { screens } = require('@maggioli-design-system/design-tokens/dist/js/tailwind-screens.js')
const { leading } = require('@maggioli-design-system/design-tokens/dist/js/tailwind-leading.js')

module.exports = {
  important: true,
  content: [
    './src/**/*.{js,jsx}',
  ],
  darkMode: [
    'variant',
    [
      '@media (prefers-color-scheme: dark) { &:is(.pref-theme-system *) }',
      '&:is(.pref-theme-dark *)',
    ],
  ],
  corePlugins: {
    preflight: false,
  },
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
    lineHeight: {
      ...leading,
    },
    screens: {
      ...screens,
    },
    spacing: {
      ...size,
    },
    extend: {
      aspectRatio: {
        ...aspectRatio,
      },
      borderRadius: {
        ...borderRadius,
      },
      borderWidth: {
        ...border,
      },
      boxShadow: {
        ...boxShadow,
      },
      fontSize: {
        ...fontSizeMagma,
        ...fontSize,
      },
      gap: {
        ...gap,
      },
      gridAutoRows: {
        1: '1fr',
      },
      gridTemplateColumns: {
        ...gridTemplateColumns,
      },
      height: {
        ...size,
      },
      maxHeight: {
        ...size,
      },
      maxWidth: {
        ...size,
      },
      minHeight: {
        ...size,
      },
      minWidth: {
        ...size,
      },
      margin: {
        ...margin,
      },
      padding: {
        ...padding,
      },
      overflow: {
        inherit: 'inherit',
      },
      textOverflow: {
        inherit: 'inherit',
      },
      transitionProperty: {
        ...transitionProperty,
      },
      transitionTimingFunction: {
        ...timingFunction,
      },
      width: {
        ...size,
      },
    },
  },
}
