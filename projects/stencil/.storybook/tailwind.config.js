module.exports = {
  purge: {
    content: [
      './src/**/*.{stories.js,tsx}',
    ],
  },
  important: false,
  presets: [
    require('@maggioli-design-system/styles'),
  ],
}
