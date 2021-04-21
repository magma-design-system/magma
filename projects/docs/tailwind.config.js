const config = require('@maggioli-design-system/styles/tailwind.config')
config.mode = 'jit'
config.purge.content = [
  './src/**/*.{js,jsx}',
  '../../node_modules/@maggioli-design-system/react/**/*.{js,jsx}',
]

module.exports = config
