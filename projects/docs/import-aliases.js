const path = require('path')

module.exports = {
  '+Docs': path.resolve(__dirname, './'),
  '+Metadata': path.resolve(__dirname, 'src/metadata/'),
  '+Package': path.resolve(__dirname, '../../'),
  '+Project': path.resolve(__dirname, '../'),
  '@Behavior': path.resolve(__dirname, '../react/src/Behavior/'),
  '@Content': path.resolve(__dirname, '../react/src/Content/'),
  '@Design': path.resolve(__dirname, '../react/src/Design/'),
  '@Gatsby': path.resolve(__dirname, 'src/components/'),
  '@Layout': path.resolve(__dirname, '../react/src/Layout/'),
  '@Library': path.resolve(__dirname, '../react/src/lib/'),
  '@Typography': path.resolve(__dirname, '../react/src/Design/Typography/'),
  '@UI': path.resolve(__dirname, '../react/src/UI/'),
}
