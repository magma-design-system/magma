import Handlebars from 'handlebars'
import StyleDictionary from 'style-dictionary'
import fs from 'fs'
import path from 'path'
import { FormatterArguments } from 'style-dictionary/types/Format'
import { ifEquals, leadZero, pascalCase, rgbCommaSeparatedChannel } from '../helpers'

const templatePath = path.resolve(__dirname, './template.hbs')
const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

Handlebars.registerHelper('ifEquals', ifEquals)
Handlebars.registerHelper('leadZero', leadZero)
Handlebars.registerHelper('pascalCase', pascalCase)
Handlebars.registerHelper('rgbCommaSeparatedChannel', rgbCommaSeparatedChannel)

StyleDictionary.registerFormat({
  name: 'flutter/color',
  formatter: ({ dictionary, platform }: FormatterArguments) => {
    return template({
      properties: dictionary.properties,
      date: new Date().toUTCString(),
      options: platform,
    })
  },
})

export default StyleDictionary
