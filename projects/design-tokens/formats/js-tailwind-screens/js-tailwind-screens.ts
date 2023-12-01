import Handlebars from 'handlebars'
import StyleDictionary from 'style-dictionary'
import fs from 'fs'
import path from 'path'
import { FormatterArguments } from 'style-dictionary/types/Format'
import { tailwindFontSize, ifEquals, safeString, ifTailwindFontSizeProp } from '../helpers'
import { version } from '../../package.json'
const templatePath = path.resolve(__dirname, './template.hbs')
const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

Handlebars.registerHelper('getSafeFontName', safeString)
Handlebars.registerHelper('ifEquals', ifEquals)
Handlebars.registerHelper('ifTailwindFontSizeProp', ifTailwindFontSizeProp)
Handlebars.registerHelper('tailwindFontSize', tailwindFontSize)

StyleDictionary.registerFormat({
  name: 'js/tailwind-screens',
  formatter: ({ dictionary, platform }: FormatterArguments) => {
    return template({
      properties: dictionary.properties,
      date: new Date().toUTCString(),
      options: platform,
      version,
    })
  },
})

export default StyleDictionary
