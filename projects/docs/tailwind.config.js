const config = require('@maggioli-design-system/styles/tailwind.config')

config.purge.content = [
  './src/**/*.{js,jsx}',
  '../../node_modules/@maggioli-design-system/react/**/*.{js,jsx}',
]

config.variants.extend = {
  backgroundColor: ['group-hover'],
  borderColor: ['group-hover'],
  textColor: ['group-hover'],
}
module.exports = config
