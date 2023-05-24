import Handlebars from 'handlebars'
import StyleDictionary from 'style-dictionary'
import fs from 'fs'
import path from 'path'
import { FormatterArguments } from 'style-dictionary/types/Format'
import { leadZero } from '../helpers'

const templatePath = path.resolve(__dirname, './scss-map.hbs')
const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

Handlebars.registerHelper('leadZero', leadZero)

StyleDictionary.registerFormat({
  name: 'scss/map',
  formatter: ({ dictionary, platform }: FormatterArguments) => {
    return template({
      properties: dictionary.properties,
      date: new Date().toUTCString(),
      options: platform,
    })
  },
})

export default StyleDictionary
