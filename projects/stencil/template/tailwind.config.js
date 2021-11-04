const config = require('@maggioli-design-system/styles/tailwind.config')

console.log('Tailwind / Stencil config')

config.important = false
config.purge.content = [
  './**/*.{ts,tsx}',
]

module.exports = config
