import Handlebars from 'handlebars'
import StyleDictionary from 'style-dictionary'
import fs from 'fs'
import hexRgb from 'hex-rgb'
import path from 'path'
import { FormatterArguments } from 'style-dictionary/types/Format'

const templatePath = path.resolve(__dirname, './template.hbs')
const template = Handlebars.compile(fs.readFileSync(templatePath).toString())

Handlebars.registerHelper('pascalCase', options => {
  if (typeof options.fn(this) !== 'string') {
    return options.fn(this)
  }
  const value = options.fn(this)
  const arr = value.split('-')

  for (let i = 0; i < arr.length; i ++) {
    if (i === 0) {
      arr[i] = arr[i].charAt(0).toLowerCase() + arr[i].slice(1)
    } else {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1)
    }
  }

  return arr.join('')
})

Handlebars.registerHelper('leadZero', value => {
  return Number(value) < 10 ? `0${value}` : value
})

Handlebars.registerHelper('ifEquals', (arg1, arg2, options) => {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this)
})

Handlebars.registerHelper('rgbChannel', value => {
  const color = hexRgb(value)
  return `${color.red}, ${color.green}, ${color.blue}`
})

StyleDictionary.registerFormat({
  name: 'dart/colors',
  formatter: ({ dictionary, platform }: FormatterArguments) => {
    return template({
      properties: dictionary.properties,
      date: new Date().toUTCString(),
      options: platform,
    })
  },
})

export default StyleDictionary
