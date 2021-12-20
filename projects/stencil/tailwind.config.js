module.exports = {
  content: [
    './src/**/*.{ts,tsx}',
    './.storybook/preview.js',
  ],
  important: false,
  corePlugins: {
    preflight: false,
  },
  presets: [
    require('@maggioli-design-system/styles'),
  ],
}
