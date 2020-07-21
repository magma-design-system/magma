// based on https://leonardocolor.io/

import { generateAdaptiveTheme } from '@adobe/leonardo-contrast-colors'
import { readFileSync, writeFileSync } from 'fs'

const colorsRawData = readFileSync('colors.json')
const { colors, ratios } = JSON.parse(colorsRawData)

const baseScale = 'adjust.tone'

const addAdaptivePalette = (color, name, colorspace) => {
  const colorKeys = typeof color === 'string' ? [color] : color
  return {
    name,
    colorKeys,
    colorspace,
    ratios,
  }
}

const getPalette = (theme, colorName, colorValue, reverse) => {
  const palette = {}
  theme.forEach((element, index) => {
    if (Object.prototype.hasOwnProperty.call(element, 'name')) {
      if (element.name === colorName) {
        let paletteSource = element.values
        if (reverse) {
          paletteSource = paletteSource.reverse()
        }
        paletteSource.forEach((element, index) => {
          const codeIndex = index + 1
          const colorCode = `c-${codeIndex < 10 ? '0' + codeIndex : codeIndex}`
          palette[colorCode] = { value: element.value }

          if (paletteSource.length === codeIndex) {
            palette.color = { value: colorValue }
          }
        })
      }
    }
  })
  return palette
}

const colorScales = colors.map(item => addAdaptivePalette(item.color, item.name, item.colorspace))

if (colorScales.length > 0) {
  let brightness = 100
  const themeLight = generateAdaptiveTheme({
    colorScales,
    baseScale,
    brightness,
  })

  brightness = 0
  const themeDark = generateAdaptiveTheme({
    colorScales,
    baseScale,
    brightness,
  })

  const palette = {
    color: {},
  }

  colors.forEach((element, index) => {
    const groupIndex = 0
    const nameIndex = 1
    const group = element.name.split('.')[groupIndex]
    const name = element.name.split('.')[nameIndex]

    if (!Object.prototype.hasOwnProperty.call(palette.color, group)) {
      palette.color[group] = {}
    }

    if (!Object.prototype.hasOwnProperty.call(palette.color[group], name)) {
      palette.color[group][name] = {
        light: getPalette(themeLight, `${group}.${name}`, element.color, true),
        dark: getPalette(themeDark, `${group}.${name}`, element.color, true),
      }
    }
  })

  const jsonPalette = JSON.stringify(palette, null, 2)

  writeFileSync('./properties/color/base.json', jsonPalette, 'utf8', err => {
    if (err) {
      console.log('An error occured while writing JSON Object to File.')
      return console.log(err)
    }
  })
}
