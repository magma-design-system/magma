import { Theme, Color, BackgroundColor } from '@adobe/leonardo-contrast-colors'
import { readFileSync } from 'fs'
import chalk from 'chalk'
import { writeFile, mkdir } from 'fs/promises'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const PROJECT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), './')
const COLOR_PATH = `${PROJECT_PATH}/properties/color`

const colorsRawData = readFileSync('colors.json')
const { colors, colorspace, ratios, smooth } = JSON.parse(colorsRawData)

const output = 'HEX'

const getBackgroundColor = (colors, name) => {
  let filteredColor = null
  colors.forEach(color => {
    if (color.name === name) {
      filteredColor = new BackgroundColor({
        colorKeys: [color.color],
        colorspace: color.colorspace !== undefined ? color.colorspace : colorspace,
        name: color.name,
        output,
        ratios: color.ratios !== undefined ? ratios[color.ratios] : ratios.default,
        smooth: color.smooth !== undefined ? color.smooth : smooth,
      })
    }
  })

  return filteredColor
}

const color = colorItem => {
  return new Color({
    colorKeys: [colorItem.color],
    colorspace: colorItem.colorspace !== undefined ? colorItem.colorspace : colorspace,
    name: colorItem.name,
    output,
    ratios: colorItem.ratios !== undefined ? ratios[colorItem.ratios] : ratios.default,
    smooth: colorItem.smooth !== undefined ? colorItem.smooth : smooth,
  })
}

const formatColor = (theme, colorName, colorValue, scaffold, seed, colorMode) => {
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

            if (seed !== undefined) {
              palette.color = { value: seed[colorMode] }
            }
          }
        })
      }
    }
  })
  return palette
}

const url = color => {
  const colorRatios = color.ratios !== undefined ? ratios[color.ratios] : ratios.default
  const query = [
    `?colorKeys=%23${color.color.substring(1)}`,
    '&base=ffffff',
    `&ratios=${colorRatios.join('%2C')}`,
    `&mode=${color.colorspace !== undefined ? color.colorspace : colorspace}`,
  ]
  return `https://leonardocolor.io/${query.join('')}`
}

const generatePaletteURL = () => {

  console.log(chalk.yellow('\nGenerating @adobe/leonardo URL palettes'))

  const palette = {
    color: {},
  }
  colors.forEach(element => {
    const groupIndex = 0
    const nameIndex = 1
    const group = element.name.split('.')[groupIndex]
    const name = element.name.split('.')[nameIndex]

    if (element.disabled === undefined) {
      element.disabled = false
    }

    if (!element.disabled) {

      if (!Object.prototype.hasOwnProperty.call(palette.color, group)) {
        palette.color[group] = {}
      }

      if (!Object.prototype.hasOwnProperty.call(palette.color[group], name)) {
        console.log(`${chalk.blue('Palette ' + name)}: ${url(element)}`)
      }
    }
  })
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

    if (element.disabled === undefined) {
      element.disabled = false
    }

    if (!element.disabled) {
      if (!Object.prototype.hasOwnProperty.call(palette.color, group)) {
        console.log(`Creating ${chalk.magenta('group')} ${group}`)
        palette.color[group] = {}
      }

      if (!Object.prototype.hasOwnProperty.call(palette.color[group], name)) {
        console.log(`Creating ${chalk.blue('color')} ${name}`)
        palette.color[group][name] = {
          light: formatColor(opts.themeLight, `${group}.${name}`, element.color, element.scaffold, element.seed, 'light'),
          dark: formatColor(opts.themeDark, `${group}.${name}`, element.color, element.scaffold, element.seed, 'dark'),
        }
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
}

const build = async () => {

  console.log(chalk.yellow('Generating color palette'))

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

  await formatPalette({
    themeLight: themeLight.contrastColors,
    themeDark: themeDark.contrastColors,
  })

  generatePaletteURL()
  console.log('')
  console.log(chalk.green('Design tokens color palette generated successfully.'))
}

build()
