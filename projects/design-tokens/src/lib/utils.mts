import StyleDictionary, { DesignTokens } from 'style-dictionary'

import * as formatsModule from '../formats/index.js'
import * as sdBrandColorConfigModule from '../config/styledictionary/sd-brand-color.config.js'
import chalk from 'chalk'
import pkg from 'fs-extra'
import { resolve } from 'path'
import { lilconfig } from 'lilconfig'

// importing for esm
const { mkdir, writeFile } = pkg

// The formats barrel and the style-dictionary configs are CommonJS .ts
// files consumed here from ESM. Their named exports are not statically
// visible to every loader (native node on the compiled dist, tsx on the
// sources, vite in the tests), so unwrap the namespace: CJS pipelines
// expose module.exports as `default`, ESM pipelines expose real named
// exports and no default.
function interopDefault<T> (mod: T): T {
  return ((mod as { default?: T }).default ?? mod)
}

const formats = interopDefault(formatsModule)
const { getBrandColorConfig } = interopDefault(sdBrandColorConfigModule)
const {
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
  cssVarsTypographyFormat,
  tailwindCss4Filter,
  cssTailwindThemeColor,
  cssVarsTransitionsFormat,
  gimpPaletteFormat,
} = formats

export async function getColorsConfig (path?: string) {
  if (path) return lilconfig('magma-design-tokens').load(path)
  return lilconfig('magma-design-tokens', {}).search()
}

export async function writeJsonTokens (tokens: unknown, name: string, dirPath?: string): Promise<void> {
  if (!dirPath) {
    throw new Error('dirPath is required')
  }

  const jsonTokens = JSON.stringify(tokens, null, 2)

  await mkdir(dirPath, { recursive: true })
  try {
    await writeFile(resolve(`${dirPath}/${name}.json`), jsonTokens, 'utf8')
  } catch (err) {
    // rethrow: a silently skipped write would leave a partial/stale export,
    // which breaks reproducibility for consumers diffing generated tokens
    console.error(chalk.red(`An error occured while writing ${name}.json`))
    throw err
  }
}

/**
 * Export colors with base style dictionary configuration (see config/sd-brand-color.config.ts)
 * @param tokens
 * @param fileName the suffix of generated files
 * @param outputDir output directory
 * @param platform array of platform that needs to build, if undefined build all platform for colors (css, dart, js)
 */

export function exportColors (
  tokens: DesignTokens,
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
      .registerFormat(gimpPaletteFormat)
      // FONT
      .registerFormat(flutterFontFormat)
      .registerFormat(jsTailwindFontFamilyFormat)
      .registerFormat(jsTailwindFontSizeFormat)
      .registerFormat(jsTailwindLeadingFormat)
      .registerFormat(jsTailwindScreensFormat)
      .registerFormat(jsTailwindPropsFormat)
      .registerFormat(cssTailwindThemeTypography)
      .registerFormat(cssVarsTypographyFormat)
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


export { deepMerge } from './deep-merge.mjs'
