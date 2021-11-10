const config = require('@maggioli-design-system/styles/tailwind.config')
config.important = false
config.purge.content = [
  './src/**/*.{ts,tsx}',
]

module.exports = config
