const path = require('path')

module.exports = {
  '#Identity': path.resolve(__dirname, '../identity/resources/'),
  '+Metadata': path.resolve(__dirname, 'src/doc/metadata/'),
  '+Package': path.resolve(__dirname, './'),
  '+Project': path.resolve(__dirname, '../'),
  '+Tokens': path.resolve(__dirname, '../design-tokens/dist/'),
  '@Behavior': path.resolve(__dirname, 'src/Behavior/'),
  '@Content': path.resolve(__dirname, 'src/Content/'),
  '@Design': path.resolve(__dirname, 'src/Design/'),
  '@Gatsby': path.resolve(__dirname, '../doc/src/components/'),
  '@Layout': path.resolve(__dirname, 'src/Layout/'),
  '@Library': path.resolve(__dirname, 'src/lib/'),
  '@Typography': path.resolve(__dirname, 'src/Design/Typography/'),
  '@UI': path.resolve(__dirname, 'src/UI/'),
  '~Sass': path.resolve(__dirname, '../styles/'),
}
