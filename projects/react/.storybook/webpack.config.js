const path = require('path')
const autoprefixer = require('autoprefixer')
const aliases = require('../import-aliases')

const localhostPort = 7177

// Export a function. Accept the base config as the only param.
module.exports = async({ config, mode }) => {
  // `mode` has a value of 'DEVELOPMENT' or 'PRODUCTION'
  // You can change the configuration based on that.
  // 'PRODUCTION' is used when building the static version of storybook.

  config.module.rules.push({
    test: /\.scss$/,
    include: [path.resolve(__dirname, '../'), path.resolve(__dirname, '../node_modules/@maggioli-design-system')],
    use: [{
      loader: 'style-loader',
    }, {
      loader: 'css-loader',
      options: {
        sourceMap: true,
      },
    }, {
      loader: 'postcss-loader',
      options: {
        plugins: () => [autoprefixer()],
      },
    }, {
      loader: 'sass-loader',
      options: {
        sourceMap: true,
      },
    }],
  })

  config.resolve.alias = aliases

  // Return the altered config
  return config
}
