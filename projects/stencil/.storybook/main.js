// https://www.mokkapps.de/blog/run-build-and-deploy-stencil-and-storybook-from-one-repository

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

    config.resolve.alias = {
      '@component': path.resolve(__dirname, '../dist/collection/components'),
    }

    config.module.rules.push({
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                require('tailwindcss'),
                require('autoprefixer')
              ],
            },
          },
        },
      ],
      include: path.resolve(__dirname, '../'),
    })

    config.resolve.fallback = { 'assert': false }
    return config
  },
}
