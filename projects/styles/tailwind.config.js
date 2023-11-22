/* eslint-disable @typescript-eslint/no-var-requires */
const { palette } = require('@maggioli-design-system/design-tokens')
const { fontFamily } = require('@maggioli-design-system/design-tokens/dist/js/tailwind-font-family')
const {
  aspectRatio,
  border,
  borderRadius,
  boxShadow,
  fontSize,
  gap,
  gridTemplateColumns,
  leading,
  margin,
  padding,
  size,
  timingFunction,
  transitionProperty,
} = require('@maggioli-design-system/design-tokens/dist/js/tailwind-props')

const screens = require('@maggioli-design-system/design-tokens/dist/js/tailwind-props')

module.exports = {
  important: true,
  content: [
    './src/**/*.{js,jsx}',
  ],
  darkMode: ['class', '.dark-mode'],
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
    screens,
    extend: {
      aspectRatio,
      borderRadius,
      borderWidth: {
        ...border,
      },
      boxShadow,
      fontSize,
      gap,
      gridAutoRows: {
        1: '1fr',
      },
      gridTemplateColumns,
      height: {
        ...size,
      },
      lineHeight: {
        leading,
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
      margin,
      padding,
      overflow: {
        inherit: 'inherit',
      },
      textOverflow: {
        inherit: 'inherit',
      },
      transitionProperty,
      transitionTimingFunction: {
        ...timingFunction,
      },
      width: {
        ...size,
      },
    },
  },
}
