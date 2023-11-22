import Handlebars from 'handlebars'
import StyleDictionary from 'style-dictionary'
import fs from 'fs'
import path from 'path'
import { version } from '../../package.json'
import { FormatterArguments } from 'style-dictionary/types/Format'
import { firstArrayElement, ifEquals, leadZero, pascalCase, rgbChannel, safeString, ifDartTextStyleProp } from '../helpers'
import { ifFlutterTextThemeVariant, flutterTextThemeVariant, ifFlutterCompatible } from './helpers'

const templatePath = path.resolve(__dirname, './template.hbs')
const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

Handlebars.registerHelper('getFirstFont', firstArrayElement)
Handlebars.registerHelper('ifEquals', ifEquals)
Handlebars.registerHelper('leadZero', leadZero)
Handlebars.registerHelper('pascalCase', pascalCase)
Handlebars.registerHelper('rgbChannel', rgbChannel)
Handlebars.registerHelper('safeString', safeString)
Handlebars.registerHelper('ifDartTextStyleProp', ifDartTextStyleProp)
Handlebars.registerHelper('getArrayFontName', value => {
  if (Array.isArray(value)) return value
  return new Handlebars.SafeString((value).replaceAll('\'', '').replaceAll(',', '","'))
})
Handlebars.registerHelper('ifFlutterTextThemeVariant', ifFlutterTextThemeVariant)
Handlebars.registerHelper('flutterTextThemeVariant', flutterTextThemeVariant)
Handlebars.registerHelper('ifFlutterCompatible', ifFlutterCompatible)

StyleDictionary.registerTransform({
  name: 'flutter/toDouble',
  type: 'value',
  matcher: token => {
    const attribute = ['lineHeight', 'fontSize', 'letterSpacing']
    return attribute.includes(token.attributes?.state ?? '')
  },
  transformer: function (token) {
    return parseFloat(token.original.value)
  },
})

StyleDictionary.registerTransform({
  name: 'flutter/fontWeight',
  type: 'value',
  matcher: token => {
    return token.attributes?.state === 'fontWeight'
  },
  transformer: function (token) {
    return `FontWeight.w${token.original.value}`
  },
})

StyleDictionary.registerFormat({
  name: 'flutter/font',
  formatter: ({ dictionary, platform }: FormatterArguments) => {
    return template({
      properties: dictionary.properties,
      date: new Date().toUTCString(),
      options: platform,
      version,
    })
  },
})

// const format = {
//   name: 'flutter/font',
//   formatter: ({ dictionary, platform }: FormatterArguments) => {
//     fs.writeFile('temp', JSON.stringify(dictionary.properties, null, 2), error => console.log(error))
//     return template({
//       properties: dictionary.properties,
//       date: new Date().toUTCString(),
//       options: platform,
//     })
//   },
// }

// export default format
export default StyleDictionary
