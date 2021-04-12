const path = require('path')

module.exports = {
  '+Metadata': path.resolve(__dirname, 'src/doc/metadata/'),
  '+Package': path.resolve(__dirname, '../../'),
  '+Project': path.resolve(__dirname, '../'),
  '@Behavior': path.resolve(__dirname, 'src/Behavior/'),
  '@Content': path.resolve(__dirname, 'src/Content/'),
  '@Design': path.resolve(__dirname, 'src/Design/'),
  '@Gatsby': path.resolve(__dirname, '../docs/src/components/'),
  '@Layout': path.resolve(__dirname, 'src/Layout/'),
  '@Library': path.resolve(__dirname, 'src/lib/'),
  '@Typography': path.resolve(__dirname, 'src/Design/Typography/'),
  '@UI': path.resolve(__dirname, 'src/UI/'),
}
