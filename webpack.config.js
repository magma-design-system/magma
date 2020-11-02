const path = require('path')
const autoprefixer = require('autoprefixer')
const alias = require('./import-aliases')

module.exports = {
  entry: './src/react/index.js',
  resolve: {
    alias,
    extensions: ['.js', '.jsx'],
  },
  output: {
    filename: 'bundle.min.js',
    library: 'maggioli-design-system',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        include: path.resolve(__dirname, '../'),
        use: [
          {
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
          },
        ],
      },
      {
        test: /\.(a?png|avif|gif|jpe?g|svg|webp)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
}
