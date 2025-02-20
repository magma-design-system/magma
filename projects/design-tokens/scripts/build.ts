import {
  getColorsConfig,
  getStyleDictionaryWithAllCustomTransform,
  writeJsonTokens,
} from '../src/lib/utils'
import { createColorTokens } from '../src/lib/color'
import { getStyleDictionaryColorConfigAllPlatforms } from '../src/config/sd-color-all-platforms.config'
import { getBrandColorConfig } from '../src/config/sd-brand-color.config'
import themeTokens from '../tokens/color/themes.json'
import { TOKENS_DIR } from './meta'

const GENERATED_TOKEN_DIR = `${TOKENS_DIR}/color/generated`

// retrieve style-dictionary with all custom transform
const styleDictionary = getStyleDictionaryWithAllCustomTransform()

getColorsConfig().then(resultConfig => {
  if (!resultConfig) throw Error('Base configuration file not found: colors-config.json')

  const { tokens, exportGroups } = createColorTokens(resultConfig.config.colors)

  // merge color tokens with theme tokens
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mergeTokens: any = {
    color: { ...tokens.color, ...themeTokens.color },
  }
  // build all colors
  styleDictionary
    .extend(getStyleDictionaryColorConfigAllPlatforms(mergeTokens))
    .buildAllPlatforms()

  // build separate colors by export config flag
  Object.keys(exportGroups).forEach(exportName => {
    styleDictionary
      .extend(getBrandColorConfig(exportName, exportGroups[exportName]))
      .buildAllPlatforms()
    // write generated tokens for script 'generate-figma-tokens'
    writeJsonTokens(exportGroups[exportName], exportName, GENERATED_TOKEN_DIR )
  })

  // build fonts
  styleDictionary.extend('./src/config/typography/default.json').buildAllPlatforms()

  // build tailwind css props
  styleDictionary.extend('./src/config/css.json').buildAllPlatforms()

  // build tailwind screens props
  styleDictionary.extend('./src/config/screens.json').buildAllPlatforms()
})
