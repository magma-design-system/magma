/* eslint-disable quote-props */
import Handlebars from 'handlebars'
import StyleDictionary from 'style-dictionary'
import fs from 'fs'
import path from 'path'
import { FormatterArguments } from 'style-dictionary/types/Format'
import { tailwindFontSize, ifEquals, safeString, ifTailwindFontSizeProp, pixelToRem } from '../helpers'
import { version } from '../../package.json'
const templatePath = path.resolve(__dirname, './template.hbs')
const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

Handlebars.registerHelper('getSafeFontName', safeString)
Handlebars.registerHelper('ifEquals', ifEquals)
Handlebars.registerHelper('ifTailwindFontSizeProp', ifTailwindFontSizeProp)
Handlebars.registerHelper('tailwindFontSize', tailwindFontSize)

StyleDictionary.registerTransform({
  name: 'tailwind/pxToRem',
  type: 'value',
  matcher: token => {
    return String(token.value).endsWith('px')
  },
  transformer: function (token) {
    return pixelToRem(token.value)
  },
})

StyleDictionary.registerTransform({
  name: 'tailwind/cssAspectRatio',
  type: 'value',
  matcher: token => {
    return String(token.value).includes(':')
  },
  transformer: function (token) {
    return token.value.replace(':', '/')
  },
})

StyleDictionary.registerFormat({
  name: 'js/tailwind-props',
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
