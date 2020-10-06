const path = require('path')

module.exports = {
  '#Assets': path.resolve(__dirname, 'src/assets/'),
  '+Tokens': path.resolve(__dirname, 'src/style-dictionary/'),
  '+Package': path.resolve(__dirname, './'),
  '@App': path.resolve(__dirname, 'src/react/app/'),
  '@Backoffice': path.resolve(__dirname, 'src/react/Backoffice/'),
  '@Design': path.resolve(__dirname, 'src/react/Design/'),
  '@Element': path.resolve(__dirname, 'src/react/Element/'),
  '@Form': path.resolve(__dirname, 'src/react/Form/'),
  '@Gatsby': path.resolve(__dirname, 'src/doc/components/'),
  '@Layout': path.resolve(__dirname, 'src/react/Layout/'),
  '@Media': path.resolve(__dirname, 'src/react/Media/'),
  '@Pattern': path.resolve(__dirname, 'src/react/Pattern/'),
  '@System': path.resolve(__dirname, 'src/react/System/'),
  '@Template': path.resolve(__dirname, 'src/react/System/Template/'),
  '@Typography': path.resolve(__dirname, 'src/react/Design/Typography/'),
  '~Sass': path.resolve(__dirname, 'src/scss/'),
}
