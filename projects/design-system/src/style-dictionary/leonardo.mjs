// based on https://leonardocolor.io/

import { generateAdaptiveTheme } from '@adobe/leonardo-contrast-colors'
import { readFileSync, writeFileSync } from 'fs'

const colorsRawData = readFileSync('colors.json')
const { colors, defaultColorspace, ratios } = JSON.parse(colorsRawData)

const baseScale = 'adjust.tone'

const reverseRatios = ratios.reverse()
const filteredRatios = (ratios, scaffold) => {
  const newRatios = []
  reverseRatios.forEach((ratioElement, ratioIdex) => {
    scaffold.forEach((scaffoldElement, scaffoldIndex) => {
      if (ratioIdex === scaffoldElement) {
        newRatios.push(ratioElement)
      }
    })
  })

  return newRatios
}

const addAdaptivePalette = (color, name, itemColorspace, itemScaffold) => {
  const colorKeys = typeof color === 'string' ? [color] : color
  const colorspace = itemColorspace !== undefined ? itemColorspace : defaultColorspace
  const scaffold = itemScaffold !== undefined ? itemScaffold : false
  const itemRatios = itemScaffold !== undefined ? filteredRatios(ratios, itemScaffold) : ratios
  return {
    name,
    colorKeys,
    colorspace,
    ratios: itemRatios,
    scaffold,
  }
}

const getPalette = (theme, colorName, colorValue, scaffold, colorDark) => {
  const palette = {}
  theme.forEach((element, index) => {
    if (Object.prototype.hasOwnProperty.call(element, 'name')) {
      if (element.name === colorName) {
        const paletteSource = element.values
        paletteSource.forEach((element, index) => {
          let codeIndex = 0

          if (scaffold) {
            scaffold.forEach((scaffoldElement, scaffoldIndex) => {
              if (scaffoldIndex === index) {
                codeIndex = scaffoldElement
              }
            })
          } else {
            codeIndex = index + 1
          }

          const colorCode = `c-${codeIndex < 10 ? '0' + codeIndex : codeIndex}`
          palette[colorCode] = { value: element.value }

          if (paletteSource.length === index + 1) {
            if (colorDark !== undefined) {
              palette.color = { value: colorDark }
            } else {
              palette.color = { value: colorValue }
            }
          }
        })
      }
    }
  })
  return palette
}

const colorScales = colors.map(item => addAdaptivePalette(item.color, item.name, item.colorspace, item.scaffold))

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
        light: getPalette(themeLight, `${group}.${name}`, element.color, element.scaffold),
        dark: getPalette(themeDark, `${group}.${name}`, element.color, element.scaffold, element.colorDark),
      }
    }
  })

  const jsonPalette = JSON.stringify(palette, null, 2)

  writeFileSync('./properties/color/base.json', jsonPalette, 'utf8', err => {
    if (err) {
      console.log('An error occured while writing JSON Object to File.')
      return console.log(err)
    }
    console.log('Colors token generated successfully.')
  })
}
