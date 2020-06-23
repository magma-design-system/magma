const path = require('path')

module.exports = {
  '#Assets': path.resolve(__dirname, 'src/assets/'),
  '$Tokens': path.resolve(__dirname, 'src/style-dictionary/'),
  '@Design': path.resolve(__dirname, 'src/react/Design/'),
  '@Element': path.resolve(__dirname, 'src/react/Element/'),
  '@Form': path.resolve(__dirname, 'src/react/Form/'),
  '@Layout': path.resolve(__dirname, 'src/react/Layout/'),
  '@Pattern': path.resolve(__dirname, 'src/react/Pattern/'),
  '@System': path.resolve(__dirname, 'src/react/System/'),
  '@Typography': path.resolve(__dirname, 'src/react/Design/Typography/'),
  '~Sass': path.resolve(__dirname, 'src/scss/'),
}
