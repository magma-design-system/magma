import { Theme, Color, BackgroundColor } from '@adobe/leonardo-contrast-colors'
import { readFileSync } from 'fs'
import chalk from 'chalk'
import { writeFile, mkdir } from 'fs/promises'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const PROJECT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), './')
const COLOR_PATH = `${PROJECT_PATH}/properties/color`

const colorsRawData = readFileSync('colors.json')
const { colors, defaultColorspace, ratios } = JSON.parse(colorsRawData)

const output = 'HEX'
const smooth = true

const getBackgroundColor = (colors, name) => {
  let filteredColor = null
  colors.forEach(color => {
    if (color.name === name) {
      filteredColor = new BackgroundColor({
        colorKeys: [color.color],
        colorSpace: color.colorSpace || defaultColorspace,
        name: color.name,
        output,
        ratios,
        smooth,
      })
    }
  })

  return filteredColor
}

const color = colorItem => {
  return new Color({
    colorKeys: [colorItem.color],
    colorSpace: colorItem.colorSpace || defaultColorspace,
    name: colorItem.name,
    output,
    ratios,
    smooth,
  })
}

const formatColor = (theme, colorName, colorValue, scaffold, colorDark) => {
  const palette = {}
  theme.forEach(element => {
    if (Object.prototype.hasOwnProperty.call(element, 'name')) {
      if (element.name === colorName) {
        const paletteSource = element.values
        paletteSource.reverse().forEach((element, index) => {
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

          const colorCode = codeIndex
          palette[colorCode] = { value: element.value }

          if (paletteSource.length === index + 1) {
            palette.color = { value: colorValue }

            if (colorDark !== undefined) {
              palette.color = { value: colorDark }
            }
          }
        })
      }
    }
  })
  return palette
}

const formatPalette = async opts => {
  console.log('Formatting color palette to JSON format')

  const palette = {
    color: {},
  }

  colors.forEach(element => {
    const groupIndex = 0
    const nameIndex = 1
    const group = element.name.split('.')[groupIndex]
    const name = element.name.split('.')[nameIndex]

    if (!Object.prototype.hasOwnProperty.call(palette.color, group)) {

      console.log(`Creating color ${chalk.magenta('group')} ${group}`)
      palette.color[group] = {}
    }

    if (!Object.prototype.hasOwnProperty.call(palette.color[group], name)) {
      console.log(`Creating color ${chalk.blue('name')} ${name}`)
      palette.color[group][name] = {
        light: formatColor(opts.themeLight, `${group}.${name}`, element.color, element.scaffold),
        dark: formatColor(opts.themeDark, `${group}.${name}`, element.color, element.scaffold, element.colorDark),
      }
    }
  })

  const jsonPalette = JSON.stringify(palette, null, 2)

  console.log('Exporting color palette')

  await mkdir(new URL(`${COLOR_PATH}`, import.meta.url), { recursive: true })
  await writeFile(new URL(`${COLOR_PATH}/base.json`, import.meta.url), jsonPalette, 'utf8', err => {
    if (err) {
      console.log(chalk.red('An error occured while writing JSON Object to File.'))
      console.log(chalk.red(err))
    }
  })
  console.log(chalk.green('Design tokens color palette generated successfully.'))
}

const build = () => {

  console.log('Generating color palette')

  const palette = []
  colors.forEach(element => {
    palette.push(color(element))
  })

  const backgroundColor = getBackgroundColor(colors, 'adjust.tone')

  const themeLight = new Theme({
    colors: palette,
    backgroundColor,
    lightness: 100,
  })

  const themeDark = new Theme({
    colors: palette,
    backgroundColor,
    lightness: 0,
  })

  formatPalette({
    themeLight: themeLight.contrastColors,
    themeDark: themeDark.contrastColors,
  })
}

build()
