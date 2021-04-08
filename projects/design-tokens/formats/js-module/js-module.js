const Handlebars = require('handlebars')
const StyleDictionary = require('style-dictionary')
const fs = require('fs')
const path = require('path')

const templatePath = path.resolve(__dirname, './js-module.hbs')

const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

Handlebars.registerHelper('eachSorted', (context, options) => {
  let ret = ''
  Object.keys(context).sort().forEach((key, index) => {
    ret = ret + options.fn({ key, value: context[key] })
  })
  return ret
})

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

StyleDictionary.registerFormat({
  name: 'js/module',
  formatter: function(dictionary, platform) {
    return template({
      properties: dictionary.properties,
      date: new Date().toUTCString(),
      options: platform,
    })
  },
})

module.exports = StyleDictionary
