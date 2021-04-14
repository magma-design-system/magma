const Handlebars = require('handlebars')
const StyleDictionary = require('style-dictionary')
const fs = require('fs')
const path = require('path')
const sortKeys = require('../../lib.js').sortKeys

const templatePath = path.resolve(__dirname, './css-vars.hbs')

const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

StyleDictionary.registerFormat({
  name: 'css/vars',
  formatter: function(dictionary, platform) {
    return template({
      properties: sortKeys(dictionary.properties),
      date: new Date().toUTCString(),
      options: platform,
    })
  },
})

module.exports = StyleDictionary
