const Handlebars = require('handlebars')
const StyleDictionary = require('style-dictionary')
const fs = require('fs')
const hexRgb = require('hex-rgb');
const path = require('path')

const templatePath = path.resolve(__dirname, './css-vars-rgb-channels.hbs')

const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

Handlebars.registerHelper('leadZero', function(value) {
  return Number(value) < 10 ? `0${value}` : value
});

Handlebars.registerHelper('rgbChannel', function(value) {
  const color = hexRgb(value)
  return `${color.red}, ${color.green}, ${color.blue}`
});

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

StyleDictionary.registerFormat({
  name: 'css/vars-rgb-channels',
  formatter: function(dictionary, platform) {
    return template({
      properties: dictionary.properties,
      date: new Date().toUTCString(),
      options: platform,
    })
  },
})

module.exports = StyleDictionary
