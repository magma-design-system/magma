const Handlebars = require('handlebars')
const StyleDictionary = require('style-dictionary')
const fs = require('fs')
const path = require('path')

const templatePath = path.resolve(__dirname, './scss-map.hbs')

const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

StyleDictionary.registerFormat({
  name: 'scss/map',
  formatter: function(dictionary, platform) {
    console.log(dictionary.properties)
    return template({
      properties: dictionary.properties,
      date: new Date().toUTCString(),
      options: platform,
    })
  },
})

module.exports = StyleDictionary
