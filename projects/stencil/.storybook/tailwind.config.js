module.exports = {
  content: [
    './src/**/*.{stories.js,tsx}',
  ],
  important: false,
  corePlugins: {
    preflight: false,
  },
  presets: [
    require('@maggioli-design-system/styles'),
  ],
}
