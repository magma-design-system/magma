module.exports = {
  core: {
    builder: "webpack5",
  },
  stories: [
    '../src/**/*.stories.js',
  ],
  addons: [
    '@storybook/addon-backgrounds',
    '@storybook/addon-docs',
    '@storybook/addon-viewport',
  ],
}
