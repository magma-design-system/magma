const path = require('path')
const autoprefixer = require('autoprefixer')

module.exports = {
  mode: 'production',
  entry: './index.js',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    filename: 'css/styles.css',
    library: 'maggioli-design-system',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        include: path.resolve(__dirname, './sass'),
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
              implementation: require('sass'),
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
}
