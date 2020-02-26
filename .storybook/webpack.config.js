const path = require('path')

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
            loader: "css-loader", options: {
                sourceMap: true
            }
        }, {
            loader: "sass-loader", options: {
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
        test: /\.(jpeg|png|jpg)$/,
        loader: 'file-loader?name=img/[name].[ext]',
    })

    // Return the altered config
    return config
}
