const config = require('@maggioli-design-system/styles/tailwind.config')
const chalk = require('chalk')

config.purge.content = [
  './src/**/*.{stories.js,tsx}',
]

module.exports = config
