module.exports = {
  core: {
    builder: 'webpack5',
  },
  stories: [
    '../src/**/*.stories.js',
    // '../src/**/*.stories.jsx',
  ],
  addons: [
    '@storybook/addon-backgrounds',
    '@storybook/addon-docs',
    '@storybook/addon-viewport',
  ],
}
