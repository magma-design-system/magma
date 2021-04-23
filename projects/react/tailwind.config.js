const config = require('@maggioli-design-system/styles/tailwind.config')
config.purge.content = [
  './src/**/*.{js,jsx,json}',
]

config.theme.extend.padding = {
  '1/1': '100%',
  '3/2': '66.67%',
  '4/3': '75%',
  '5/4': '80%',
  '16/9': '56.25%',
}

module.exports = config
