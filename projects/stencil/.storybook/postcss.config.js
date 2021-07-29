const chalk = require('chalk')

console.log(chalk.green('Storybook config / PostCSS'))

module.exports = {
  plugins: [
    require('postcss-import'),
    require('autoprefixer')({
      flexbox: 'no-2009',
    }),
    require('tailwindcss')('./.storybook/tailwind.config.js'),
  ]
}
