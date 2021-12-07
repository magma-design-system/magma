module.exports = {
  purge: {
    content: [
      './src/**/*.{ts,tsx}',
    ],
  },
  important: false,
  presets: [
    require('@maggioli-design-system/styles'),
  ],
}
