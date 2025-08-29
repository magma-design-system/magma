const path = require('path')
module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-iconsauce')('./.storybook/iconsauce.config.js'),
    require('@tailwindcss/postcss'),
    require('autoprefixer')({
      flexbox: 'no-2009',
    }),
  ]
}
