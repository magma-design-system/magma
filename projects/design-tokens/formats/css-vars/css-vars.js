const Handlebars = require('handlebars')
const StyleDictionary = require('style-dictionary')
const fs = require('fs')
const path = require('path')

const templatePath = path.resolve(__dirname, './css-vars.hbs')

const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

Handlebars.registerHelper('leadZero', value => {
  return Number(value) < 10 ? `0${value}` : value
})

Handlebars.registerHelper('ifEquals', (arg1, arg2, options) => {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this)
})

StyleDictionary.registerFormat({
  name: 'css/vars',
  formatter: (dictionary, platform) => {
    return template({
      properties: dictionary.properties,
      date: new Date().toUTCString(),
      options: platform,
    })
  },
})

module.exports = StyleDictionary
