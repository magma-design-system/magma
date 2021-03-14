let StyleDictionary = require('./formats/scss-map/scss-map').extend('./config.json')
StyleDictionary = require('./formats/js-config/js-config').extend('./config.json')
StyleDictionary.buildAllPlatforms()
