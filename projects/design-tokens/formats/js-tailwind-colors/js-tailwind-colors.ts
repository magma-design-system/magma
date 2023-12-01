import Handlebars from 'handlebars'
import StyleDictionary from 'style-dictionary'
import fs from 'fs'
import path from 'path'
import { version } from '../../package.json'
import { FormatterArguments } from 'style-dictionary/types/Format'
import { ifEquals, leadZero, rgbChannel } from '../helpers'

const templatePath = path.resolve(__dirname, './template.hbs')
const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

Handlebars.registerHelper('ifEquals', ifEquals)
Handlebars.registerHelper('leadZero', leadZero)
Handlebars.registerHelper('rgbChannel', rgbChannel)

StyleDictionary.registerFormat({
  name: 'js/tailwind-colors',
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
