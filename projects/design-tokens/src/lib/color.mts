import { BackgroundColor, Color, InterpolationColorspace, Theme, type ContrastColor, type ContrastColorBackground, type RgbHexColor } from '@/leonardo/index.js'
import chalk from 'chalk'
import DEFAULTS from '../config/deafult-color.json' with {type: 'json'}
import { deepMerge } from './utils.mjs'
export interface SeedConfig {
  light: RgbHexColor,
  dark: RgbHexColor,
}
export interface ColorConfig {
  color: RgbHexColor
  export?: string[],
  name: string,
  seed?: SeedConfig,
  disabled?: boolean,
  title?: string,
  alias?: string,
  ratios?: string,
  formula?: string,
}

export type Formula = 'wcag2' | 'wcag3'
export type RatioData = {[key: string]: number[]}

export interface MagmaConfig {
  colorspace: string,
  smooth: boolean,
  formula: Formula,
  // eslint-disable-next-line no-unused-vars
  ratios: {[K in Formula]: RatioData}
  colors: ColorConfig[]
}

export type ThemeContrastColor = [ContrastColorBackground, ...ContrastColor[]]
// interface DesignTokensConfig {
//   colors: ColorConfig[],
//   ratios: {[key: string]: number[]}
// }

function getBackgroundColor (): BackgroundColor {
  return new BackgroundColor({
    colorKeys: ['#000000'],
    colorspace: DEFAULTS.colorspace as InterpolationColorspace,
    name: 'backgroud',
    ratios: DEFAULTS.ratios.wcag2.tone,
    smooth: DEFAULTS.smooth,
  })
}

export function formatColortoTokens (contrastColors: ContrastColor[], colorName, colorValue, seed?, colorMode?) {

  const palette: {[key: string]: {value: string}} = {}

  contrastColors.forEach(element => {
    if (element.name === colorName) {
      const paletteSource = element.values
      paletteSource.toReversed().forEach((element, index) => {
        let codeIndex = 0
        codeIndex = index + 1

        const colorCode = codeIndex
        palette[colorCode] = { value: element.value }

        if (paletteSource.length === index + 1) {
          palette.color = { value: colorValue }

          if (seed !== undefined && colorMode !== undefined) {
            palette.color = { value: seed[colorMode] }
          }
        }
      })
    }
  })
  return palette
}

export function createColor (colorItem, config: MagmaConfig): Color {
  const formula = colorItem.formula ?? config.formula
  return new Color({
    colorKeys: [colorItem.color],
    colorspace: colorItem.colorspace !== undefined ? colorItem.colorspace : config.colorspace,
    name: colorItem.name,
    ratios: colorItem.ratios !== undefined ? config.ratios[formula][colorItem.ratios] : config.ratios[formula].default,
    smooth: colorItem.smooth ?? config.smooth,
  })
}

/**
 * Create color tokens from co
 * @param magmaConfig
 * @returns
 */
export function createColorTokens (magmaConfig: MagmaConfig) {

  const config: MagmaConfig = deepMerge(magmaConfig, DEFAULTS)

  const palette: {[key:string]: Color[]} = {
    wcag2: [],
    wcag3: [],
  }
  config.colors.forEach(element => {
    palette[element.formula ?? config.formula].push(createColor(element, config))
  })

  const backgroundColor = getBackgroundColor()
  // const backgroundColorDark = getBackgroundColor('dark')
  // console.log('background color light', backgroundColor.backgroundColorScale)
  // console.log('background color dark', backgroundColorDark.colorKeys)

  // it doesnt matter backgroundColor color in this case because the lightness is 100 or 0
  // so the background color is basically #ffffff for light theme and #000000 for dark theme
  const themeLight = new Theme({
    colors: palette.wcag3,
    backgroundColor,
    lightness: 100,
    formula: 'wcag3',
  })

  const themeDark = new Theme({
    colors: palette.wcag3,
    backgroundColor,
    lightness: 0,
    formula: 'wcag3',
  })

  const themeToneLight = new Theme({
    colors: palette.wcag2,
    backgroundColor,
    lightness: 100,
  })

  const themeToneDark = new Theme({
    colors: palette.wcag2,
    backgroundColor,
    lightness: 0,
  })

  console.info('Formatting color palette to JSON Design Tokens format')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tokens: any = {
    color: {},
  }

  const exportGroups = {}

  config.colors.forEach(element => {
    const groupIndex = 0
    const nameIndex = 1
    const group = element.name.split('.')[groupIndex]
    const name = element.name.split('.')[nameIndex]

    if (element.disabled === undefined) {
      element.disabled = false
    }

    if (!element.disabled) {

      if (!Object.hasOwn(tokens.color, group)) {
        console.info(`Creating ${chalk.magenta('group')} ${group}`)
        tokens.color[group] = {}
      }
      if (!Object.hasOwn(tokens.color[group], name)) {
        console.info(`Creating ${chalk.blue('color')} ${name}`)
        if (element.formula === 'wcag2') {
          tokens.color[group][name] = {
            light: formatColortoTokens(themeToneLight.contrastColors.slice(1) as ContrastColor[], `${group}.${name}`, element.color, element.seed, 'light'),
            dark: formatColortoTokens(themeToneDark.contrastColors.slice(1) as ContrastColor[], `${group}.${name}`, element.color, element.seed, 'dark'),
          }
        } else {
          tokens.color[group][name] = {
            light: formatColortoTokens(themeLight.contrastColors.slice(1) as ContrastColor[], `${group}.${name}`, element.color, element.seed, 'light'),
            dark: formatColortoTokens(themeDark.contrastColors.slice(1) as ContrastColor[], `${group}.${name}`, element.color, element.seed, 'dark'),
          }
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
            light: tokens.color[group][name].light,
            dark: tokens.color[group][name].dark,
          }
        })
      }
    }
  })

  return { tokens, exportGroups }
}

