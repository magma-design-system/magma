import Handlebars from 'handlebars'
import StyleDictionary from 'style-dictionary'
import fs from 'fs'
import path from 'path'
import { FormatterArguments } from 'style-dictionary/types/Format'
import { ifEquals, leadZero, humanCase } from '../helpers'

const templatePath = path.resolve(__dirname, './template.hbs')
const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

Handlebars.registerHelper('coolorizeName', humanCase)
Handlebars.registerHelper('leadZero', leadZero)
Handlebars.registerHelper('ifEquals', ifEquals)

StyleDictionary.registerFormat({
  name: 'json/coolors',
  formatter: ({ dictionary, platform }: FormatterArguments) => {
    return template({
      properties: dictionary.properties,
      date: new Date().toUTCString(),
      options: platform,
    })
  },
})

export default StyleDictionary
