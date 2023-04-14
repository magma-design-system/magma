import Handlebars from 'handlebars'
import StyleDictionary from 'style-dictionary'
import fs from 'fs'
import path from 'path'
import { FormatterArguments } from 'style-dictionary/types/Format'
import { sortKeys } from '../lib'

const templatePath = path.resolve(__dirname, './scss-map.hbs')

Handlebars.registerHelper('leadZero', value => {
  return Number(value) < 10 ? `0${value}` : value
})

const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

StyleDictionary.registerFormat({
  name: 'scss/map',
  formatter: ({ dictionary, platform }: FormatterArguments) => {
    return template({
      properties: sortKeys(dictionary.properties),
      date: new Date().toUTCString(),
      options: platform,
    })
  },
})

export default StyleDictionary
