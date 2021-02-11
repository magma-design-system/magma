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
    include: [path.resolve(__dirname, '../')],
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
        postcssOptions: {
          plugins: [
            [
              'autoprefixer',
            ],
          ],
        },
      },
    }, {
      loader: 'sass-loader',
      options: {
        sourceMap: true,
      },
    }],
  })

  config.resolve.alias = aliases

  // To fix error: "Module not found: Error: Can't resolve 'fs'"
  // https://stackoverflow.com/questions/57161839/module-not-found-error-cant-resolve-fs-in
  config.node = {
    fs: 'empty',
  }

  // Return the altered config
  return config
}
