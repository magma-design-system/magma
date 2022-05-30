const Handlebars = require('handlebars')
const StyleDictionary = require('style-dictionary')
const fs = require('fs')
const path = require('path')
const hexRgb = require('hex-rgb')
const { sortKeys } = require('../lib.js')

const templatePath = path.resolve(__dirname, './js-module-tailwind-config.hbs')

const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

Handlebars.registerHelper('leadZero', value => {
  return Number(value) < 10 ? `0${value}` : value
})

Handlebars.registerHelper('rgbChannel', value => {
  const color = hexRgb(value)
  return `${color.red}, ${color.green}, ${color.blue}`
})

Handlebars.registerHelper('ifEquals', (arg1, arg2, options) => {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this)
})

StyleDictionary.registerFormat({
  name: 'js/module-tailwind-config',
  formatter: (dictionary, platform) => {
    return template({
      properties: sortKeys(dictionary.properties),
      date: new Date().toUTCString(),
      options: platform,
    })
  },
})

module.exports = StyleDictionary
