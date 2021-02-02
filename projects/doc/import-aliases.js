const path = require('path')

module.exports = {
  '#Identity': path.resolve(__dirname, '../identity/static/'),
  '+Metadata': path.resolve(__dirname, 'src/metadata/'),
  '+Package': path.resolve(__dirname, './'),
  '+Project': path.resolve(__dirname, '../'),
  '+Tokens': path.resolve(__dirname, '../design-tokens/dist/'),
  '@Behavior': path.resolve(__dirname, '../react/src/Behavior/'),
  '@Content': path.resolve(__dirname, '../react/src/Content/'),
  '@Design': path.resolve(__dirname, '../react/src/Design/'),
  '@Gatsby': path.resolve(__dirname, 'src/components/'),
  '@Layout': path.resolve(__dirname, '../react/src/Layout/'),
  '@Library': path.resolve(__dirname, '../react/src/lib/'),
  '@Typography': path.resolve(__dirname, '../react/src/Design/Typography/'),
  '@UI': path.resolve(__dirname, '../react/src/UI/'),
  '~Sass': path.resolve(__dirname, '../styles/'),
}
