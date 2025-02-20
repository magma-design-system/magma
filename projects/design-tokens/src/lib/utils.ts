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
} from '@/formats/index'
import { getBrandColorConfig } from '../config/sd-brand-color.config'
import chalk from 'chalk'
import { mkdir, writeFile } from 'fs-extra'
import { resolve } from 'path'
import { lilconfig } from 'lilconfig'

export async function getColorsConfig (path?: string) {
  if (path) return lilconfig('magma-design-tokens').load(path)
  return lilconfig('magma-design-tokens', {}).search()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function writeJsonTokens (tokens: any, name: string, dirPath: string) {
  const jsonTokens = JSON.stringify(tokens, null, 2)

  mkdir(dirPath, { recursive: true })
  writeFile(resolve(`${dirPath}/${name}.json`), jsonTokens, 'utf8', err => {
    if (err) {
      console.error(
        chalk.red('An error occured while writing JSON Object to File.'),
      )
      console.error(chalk.red(err))
    }
  })
}

export function exportColors (
  tokens,
  fileName: string,
  outputDir?: string,
) {
  StyleDictionary.registerFormat(cssHexFormat)
    .registerFormat(cssRgbFormat)
    .registerFormat(flutterColorFormat)
    .extend(getBrandColorConfig(fileName, tokens, outputDir))
    .buildAllPlatforms()
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
      .registerFormat(jsonCoolorsFormat)
      // FONT
      .registerFormat(flutterFontFormat)
      .registerFormat(jsTailwindFontFamilyFormat)
      .registerFormat(jsTailwindFontSizeFormat)
      .registerFormat(jsTailwindLeadingFormat)
      .registerFormat(jsTailwindScreensFormat)
      .registerFormat(jsTailwindPropsFormat)
      // transform for flutter font
      .registerTransform(flutterFontWeightTransform)
      .registerTransform(flutterToDoubleTransform)
      // transform for tailwind props
      .registerTransform(tailwindcssAspetctRationTransform)
      .registerTransform(tailwindPxToRemTransform)
  )
}
