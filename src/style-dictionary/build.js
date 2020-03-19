const StyleDictionary = require('./formats/scss-map/scss-map')
  .extend('./config.json')

StyleDictionary.buildAllPlatforms()
