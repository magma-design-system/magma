const path = require('path')
const autoprefixer = require('autoprefixer')
const tailwindcss = require('tailwindcss')
const aliases = require('../import-aliases')

module.exports = async({ config }) => {
  config.mode = 'production'

  config.module.rules.push({
    test: /\.s?css$/,
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
        sourceMap: true,
        implementation: require('postcss'),
        postcssOptions: {
          plugins: [
            [
              tailwindcss('tailwind.config.js'),
              autoprefixer,
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
  config.resolve.fallback = {
    fs: 'empty',
    crypto: false,
    assert: false,
  }

  return config
}
