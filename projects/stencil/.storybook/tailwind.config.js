const config = require('@maggioli-design-system/styles/tailwind.config')
const chalk = require('chalk')

console.log(chalk.green('Storybook config / Tailwind'))

config.purge.content = [
  './src/**/*.{stories.js,tsx}',
]

module.exports = config
