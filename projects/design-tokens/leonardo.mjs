import { BackgroundColor, Color, Theme } from '@adobe/leonardo-contrast-colors'
import chalk from 'chalk'
import { readFileSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import Handlebars from 'handlebars'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const PROJECT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), './')
const COLOR_PATH = `${PROJECT_PATH}/tokens/color/generated`
const CONFIG_PATH = `${PROJECT_PATH}/config/colors/generated`
const TEMPLATES_PATH = `${PROJECT_PATH}/template`

const colorsRawData = readFileSync(resolve(PROJECT_PATH, 'colors-config.json'))
const { colors, colorspace, ratios, smooth } = JSON.parse(colorsRawData)

const output = 'HEX'

const ifEquals = (valueA, valueB, options) => {
  return (valueA === valueB) ? options.fn(this) : options.inverse(this)
}

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

const exportPalettes = async palettes => {

  const configTemplate = await readFile(resolve(`${TEMPLATES_PATH}/config.hbs`))
  Handlebars.registerHelper('ifEquals', ifEquals)
  const template = Handlebars.compile(configTemplate.toString())

  for (const palette of Object.keys(palettes)) {
    const jsonPalette = JSON.stringify(palettes[palette], null, 2)

    console.info(`Exporting ${chalk.yellow('color palette')} ${palette}`)

    await mkdir(COLOR_PATH, { recursive: true })
    await writeFile(resolve(`${COLOR_PATH}/${palette}.json`), jsonPalette, 'utf8', err => {
      if (err) {
        console.error(chalk.red('An error occured while writing JSON Object to File.'))
        console.error(chalk.red(err))
      }
    })

    await mkdir(CONFIG_PATH, { recursive: true })
    const data = {
      fileName: palette,
    }
    const compiledConfig = template(data)

    await writeFile(resolve(`${CONFIG_PATH}/${palette}.json`),
      compiledConfig,
      'utf8',
      err => {
        if (err) {
          console.error('An error occured while writing JSON Object file.')
          return console.error(err)
        }
      },
    )
  }
}

const formatPalette = async opts => {
  console.info('Formatting color palette to JSON format')

  const palette = {
    color: {},
  }

  const exportGroups = {}

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
        console.info(`Creating ${chalk.magenta('group')} ${group}`)
        palette.color[group] = {}
      }
      if (!Object.prototype.hasOwnProperty.call(palette.color[group], name)) {
        console.info(`Creating ${chalk.blue('color')} ${name}`)
        palette.color[group][name] = {
          light: formatColor(opts.themeLight, `${group}.${name}`, element.color, element.scaffold, element.seed, 'light'),
          dark: formatColor(opts.themeDark, `${group}.${name}`, element.color, element.scaffold, element.seed, 'dark'),
        }
      }

      if (element.export !== undefined) {
        element.export.forEach(exportElement => {
          if (exportGroups[exportElement] === undefined) {
            exportGroups[exportElement] = {}
            exportGroups[exportElement].color = {}
          }
          if (exportGroups[exportElement].color[group] === undefined) {
            exportGroups[exportElement].color[group] = {}
          }
          exportGroups[exportElement].color[group][name] = {
            light: palette.color[group][name].light,
            dark: palette.color[group][name].dark,
          }
        })
      }
    }
  })

  // if (exportGroups !== {}) {
  await exportPalettes(exportGroups)
  // }

  const jsonPalette = JSON.stringify(palette, null, 2)

  console.info('Exporting whole color palette')

  await mkdir(COLOR_PATH, { recursive: true })
  await writeFile(resolve(`${COLOR_PATH}/base.json`), jsonPalette, 'utf8', err => {
    if (err) {
      console.error(chalk.red('An error occured while writing JSON Object to File.'))
      console.error(chalk.red(err))
    }
  })
}

const build = async () => {

  console.info(chalk.yellow('Generating color palette'))

  const palette = []
  colors.forEach(element => {
    palette.push(color(element))
  })

  const backgroundColor = getBackgroundColor(colors, 'tone.neutral')

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

  console.info('')
  console.info(chalk.green('Design tokens color palette generated successfully.'))
}

build()
