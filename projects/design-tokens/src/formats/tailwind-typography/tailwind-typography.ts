import Handlebars from 'handlebars'
import StyleDictionary from 'style-dictionary'
import fs from 'fs'
import path from 'path'
import { version } from '../../../package.json'
import { FormatterArguments } from 'style-dictionary/types/Format'
import { ifEquals, ifTailwindFontSizeProp, kebabCase, leadZero, rgbChannel, tailwindFontSize } from '../helpers'
import { writeFile } from 'fs-extra'

const templatePath = path.resolve(__dirname, './template.hbs')
const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

Handlebars.registerHelper('ifEquals', ifEquals)
Handlebars.registerHelper('leadZero', leadZero)
Handlebars.registerHelper('rgbChannel', rgbChannel)
Handlebars.registerHelper('kebabCase', kebabCase)
Handlebars.registerHelper('ifTailwindFontSizeProp', ifTailwindFontSizeProp)
Handlebars.registerHelper('tailwindFontSize', tailwindFontSize)

export const cssTailwindThemeTypography: StyleDictionary.Format = {
  name: 'css/tailwind-theme-typography',
  formatter: ({ dictionary, platform }: FormatterArguments) => {
    console.log('THEME Tailwind 4 Typography')
    writeFile('temp.json', JSON.stringify(dictionary.properties, null, 2))
    return template({
      properties: dictionary.properties,
      date: new Date().toUTCString(),
      options: platform,
      version,
    })
  },
}
