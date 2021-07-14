const config = require('@maggioli-design-system/styles/tailwind.config')

console.log('Tailwind / Storybook config')

config.purge.content = [
  './src/**/*.{stories.js,tsx}',
]

module.exports = config
