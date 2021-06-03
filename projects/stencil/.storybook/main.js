const path = require('path')

module.exports = {
  'core': {
    'builder': 'webpack5',
  },
  'stories': [
    '../src/**/*.stories.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/**/*.stories.js',
  ],
  'addons': [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-notes',
    '@storybook/addon-viewport',
    {
      name: '@storybook/addon-postcss',
      options: {
          postcssLoaderOptions: {
              implementation: require('postcss'),
          },
      },
    },
  ],
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    config.module.rules.push({
      test: /\.scss$/,
      include: [path.resolve(__dirname, '../')],
      use: [
        'style-loader',
        'css-loader',
        'sass-loader'
      ],
    })

    // config.resolve.alias = aliases
    config.resolve.fallback = { 'assert': false }
    return config
  },
}
