const Handlebars = require('handlebars')
const StyleDictionary = require('style-dictionary')
const fs = require('fs')
const path = require('path')
const { sortKeys } = require('../lib.js')

const templatePath = path.resolve(__dirname, './scss-map.hbs')

Handlebars.registerHelper('leadZero', value => {
  return Number(value) < 10 ? `0${value}` : value
})

const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

StyleDictionary.registerFormat({
  name: 'scss/map',
  formatter: (dictionary, platform) => {
    return template({
      properties: sortKeys(dictionary.properties),
      date: new Date().toUTCString(),
      options: platform,
    })
  },
})

module.exports = StyleDictionary
