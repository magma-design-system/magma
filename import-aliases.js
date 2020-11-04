const path = require('path')

module.exports = {
  '#Assets': path.resolve(__dirname, 'src/assets/'),
  '+Package': path.resolve(__dirname, './'),
  '+Tokens': path.resolve(__dirname, 'src/style-dictionary/'),
  '@Behavior': path.resolve(__dirname, 'src/react/Behavior/'),
  '@Content': path.resolve(__dirname, 'src/react/Content/'),
  '@Design': path.resolve(__dirname, 'src/react/Design/'),
  '@Gatsby': path.resolve(__dirname, 'src/doc/components/'),
  '@Layout': path.resolve(__dirname, 'src/react/Layout/'),
  '@Typography': path.resolve(__dirname, 'src/react/Design/Typography/'),
  '@UI': path.resolve(__dirname, 'src/react/UI/'),
  '~Sass': path.resolve(__dirname, 'src/scss/'),
  '£Project': path.resolve(__dirname, 'projects/'),
}
