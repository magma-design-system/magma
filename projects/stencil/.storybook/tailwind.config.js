module.exports = {
  content: [
    './src/**/*.{stories.js,tsx}',
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
