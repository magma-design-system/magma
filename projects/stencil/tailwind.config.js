const config = require('@maggioli-design-system/styles/tailwind.config')

config.important = false
config.purge.content = [
  './src/**/*.{js,jsx,ts,tsx,json}',
]

module.exports = config
