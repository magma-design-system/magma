const path = require('path')
const autoprefixer = require('autoprefixer')

// Export a function. Accept the base config as the only param.
module.exports = async ({ config, mode }) => {
    // `mode` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    config.module.rules.push({
        test: /\.scss$/,
        include: path.resolve(__dirname, '../'),
        use: [{
            loader: "style-loader"
        }, {
            loader: "css-loader",
            options: {
                sourceMap: true
            }
        }, {
          loader: 'postcss-loader',
          options: {
            plugins: () => [ autoprefixer() ]
          }
        }, {
            loader: "sass-loader",
            options: {
                sourceMap: true,
                data: "$app: storybook;"
            }
        }]
    })
    config.module.rules.push({
        test: /\.(ttf|woff|woff2|eot|otf)$/,
        exclude: /node_modules/,
        use: ['file-loader']
    })
    config.module.rules.push({
        test: /\.(jpeg|png|jpg|svg)$/,
        loader: 'file-loader?name=img/[name].[ext]',
    })

    config.resolve.alias = {
      '#Assets': path.resolve(__dirname, '../src/assets/'),
      '$Tokens': path.resolve(__dirname, '../src/style-dictionary/'),
      '@Design': path.resolve(__dirname, '../src/react/Design/'),
      '@Form': path.resolve(__dirname, '../src/react/Form/'),
      '@Layout': path.resolve(__dirname, '../src/react/Layout/'),
      '@System': path.resolve(__dirname, '../src/react/System/'),
      '@Typography': path.resolve(__dirname, '../src/react/Design/Typography/'),
      '~Sass': path.resolve(__dirname, '../src/scss/'),
    }

    // Return the altered config
    return config
}
