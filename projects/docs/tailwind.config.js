const config = require('@maggioli-design-system/styles/tailwind.config')
config.mode = 'jit'
config.purge.content = [
  './src/**/*.{js,jsx}',
]

module.exports = config
