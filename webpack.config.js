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
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.min.js',
    chunkFilename: '[id].js',
    publicPath: '',
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
      },
      // {
      //   test: /\.(png|jpe?g|gif)$/,
      //   loader: 'url-loader?limit=10000&name=img/[name].[ext]',
      // },
    ],
  },
}
