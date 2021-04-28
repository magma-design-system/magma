const path = require('path')
const alias = require('./import-aliases')

module.exports = {
  mode: 'production',
  // entry: './src/index.js',
  resolve: {
    alias,
    extensions: ['.js', '.jsx'],
    fallback: { crypto: false },
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
              sourceMap: true,
              implementation: require('postcss'),
              postcssOptions: {
                plugins: [
                  [
                    require('autoprefixer'),
                    require('tailwindcss'),
                  ],
                ],
              },
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
        type: 'asset',
      },
    ],
  },
}
