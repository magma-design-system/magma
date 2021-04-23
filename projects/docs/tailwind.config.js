const config = require('@maggioli-design-system/styles/tailwind.config')
config.mode = 'jit'
config.purge.content = [
  './src/**/*.{js,jsx}',
  '../../node_modules/@maggioli-design-system/react/**/*.{js,jsx}',
]
// config.theme.extend.padding = {
//   '1/1': '100%',
//   '3/2': '66.67%',
//   '4/3': '75%',
//   '5/4': '80%',
//   '16/9': '56.25%',
// }

config.variants.extend = {
  backgroundColor: ['group-hover'],
  borderColor: ['group-hover'],
  textColor: ['group-hover'],
}
module.exports = config
