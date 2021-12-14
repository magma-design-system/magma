module.exports = {
  purge: {
    content: [
      './src/**/*.{ts,tsx}',
      './.storybook/preview.js',
    ],
  },
  important: false,
  presets: [
    require('@maggioli-design-system/styles'),
  ],
}
