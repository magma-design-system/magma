import StyleDictionary from 'style-dictionary'

import {
  flutterColorFormat,
  cssHexFormat,
  cssRgbFormat,
  jsFormat,
  jsTailwindColorsFormat,
  jsonCoolorsFormat,
  jsTailwindFontFamilyFormat,
  flutterFontFormat,
  flutterFontWeightTransform,
  flutterToDoubleTransform,
  jsTailwindFontSizeFormat,
  jsTailwindLeadingFormat,
  jsTailwindPropsFormat,
  jsTailwindScreensFormat,
  tailwindcssAspetctRationTransform,
  tailwindPxToRemTransform,
  cssTailwindThemeTypography,
  tailwindCss4Filter,
  cssTailwindThemeColor,
  cssVarsTransitionsFormat,
} from '../formats/index.js'
import { getBrandColorConfig } from '../config/styledictionary/sd-brand-color.config.js'
import chalk from 'chalk'
import pkg from 'fs-extra'
import { resolve } from 'path'
import { lilconfig } from 'lilconfig'

// importing for esm
const { mkdir, writeFile } = pkg

export async function getColorsConfig (path?: string) {
  if (path) return lilconfig('magma-design-tokens').load(path)
  return lilconfig('magma-design-tokens', {}).search()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function writeJsonTokens (tokens: any, name: string, dirPath: string) {
  const jsonTokens = JSON.stringify(tokens, null, 2)

  mkdir(dirPath, { recursive: true }).then(() => {
    writeFile(resolve(`${dirPath}/${name}.json`), jsonTokens, 'utf8', err => {
      if (err) {
        console.error(
          chalk.red('An error occured while writing JSON Object to File.'),
        )
        console.error(chalk.red(err))
      }
    })
  })
}

/**
 * Export colors with base style dictionary configuration (see config/sd-brand-color.config.ts)
 * @param tokens
 * @param fileName the suffix of generated files
 * @param outputDir output directory
 * @param platform array of platform that needs to build, if undefined build all platform for colors (css, dart, js)
 */
export function exportColors (
  tokens,
  fileName: string,
  outputDir?: string,
  platform?: string[],
) {
  const s = StyleDictionary.registerFormat(cssHexFormat)
    .registerFormat(cssRgbFormat)
    .registerFormat(jsTailwindColorsFormat)
    .registerFormat(flutterColorFormat)
    .extend(getBrandColorConfig(fileName, tokens, outputDir))
  if (platform) {
    platform.forEach(p => s.buildPlatform(p))
  } else {
    s.buildAllPlatforms()
  }
}

export function getStyleDictionaryWithAllCustomTransform (): StyleDictionary.Core {
  return (
    StyleDictionary
      // COLOR
      .registerFormat(jsFormat)
      .registerFormat(jsTailwindColorsFormat)
      .registerFormat(flutterColorFormat)
      .registerFormat(cssHexFormat)
      .registerFormat(cssRgbFormat)
      .registerFormat(cssTailwindThemeColor)
      .registerFormat(jsonCoolorsFormat)
      // FONT
      .registerFormat(flutterFontFormat)
      .registerFormat(jsTailwindFontFamilyFormat)
      .registerFormat(jsTailwindFontSizeFormat)
      .registerFormat(jsTailwindLeadingFormat)
      .registerFormat(jsTailwindScreensFormat)
      .registerFormat(jsTailwindPropsFormat)
      .registerFormat(cssTailwindThemeTypography)
      // TRANSITIONS
      .registerFormat(cssVarsTransitionsFormat)
      // transform for flutter font
      .registerTransform(flutterFontWeightTransform)
      .registerTransform(flutterToDoubleTransform)
      // transform for tailwind props
      .registerTransform(tailwindcssAspetctRationTransform)
      .registerTransform(tailwindPxToRemTransform)
      // filter for tailwind4 props
      .registerFilter(tailwindCss4Filter)
  )
}


/**
 * Deep merge of two object
 *
 * @param {object} target
 * @param {object} source
 * @returns {object} object merged
 */
export function deepMerge (target, source) {
  const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj)

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          target[key] = {}
        }
        deepMerge(target[key], source[key])
      } else if (Array.isArray(source[key])) {
        target[key] = source[key]
      } else {
        target[key] = source[key]
      }
    }
  }

  return target
}
