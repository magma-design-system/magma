import Handlebars, { HelperOptions } from 'handlebars'
import StyleDictionary from 'style-dictionary'
import fs from 'fs'
import path from 'path'
import { version } from '../../package.json'
import { FormatterArguments } from 'style-dictionary/types/Format'
import { pixelToRem } from '../helpers'

const templatePath = path.resolve(__dirname, './template.hbs')
const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

Handlebars.registerHelper('pixelToRem', (options: HelperOptions) => {
  return pixelToRem(options.fn(this))
})

StyleDictionary.registerFormat({
  name: 'js/tailwind-leading',
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
