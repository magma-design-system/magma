import Handlebars from 'handlebars'
import StyleDictionary from 'style-dictionary'
import fs from 'fs'
import path from 'path'
import { FormatterArguments } from 'style-dictionary/types/Format'
import { firstArrayElement, ifEquals, leadZero, pascalCase, rgbChannel, safeString, dartTextStyle } from '../helpers'

const templatePath = path.resolve(__dirname, './template.hbs')
const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

Handlebars.registerHelper('getFirstFont', firstArrayElement)
Handlebars.registerHelper('ifEquals', ifEquals)
Handlebars.registerHelper('leadZero', leadZero)
Handlebars.registerHelper('pascalCase', pascalCase)
Handlebars.registerHelper('rgbChannel', rgbChannel)
Handlebars.registerHelper('safeString', safeString)
Handlebars.registerHelper('dartTextStyle', dartTextStyle)
Handlebars.registerHelper('getArrayFontName', value => {
  return new Handlebars.SafeString((value).replaceAll('\'', '').replaceAll(',', '","'))
})

StyleDictionary.registerFormat({
  name: 'flutter/font',
  formatter: ({ dictionary, platform }: FormatterArguments) => {
    return template({
      properties: dictionary.properties,
      date: new Date().toUTCString(),
      options: platform,
    })
  },
})

export default StyleDictionary
