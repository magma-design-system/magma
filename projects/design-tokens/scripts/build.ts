import {
  getColorsConfig,
  getStyleDictionaryWithAllCustomTransform,
} from '../src/lib/utils'
import { createColorTokens } from '../src/lib/color'
import { getStyleDictionaryColorConfigAllPlatforms } from '../src/config/sd-color-all-platforms.config'
import { getBrandColorConfig } from '../src/config/sd-brand-color.config'
import themeTokens from '../tokens/color/themes.json'

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
  })

  // build fonts
  styleDictionary.extend('./config/typography/default.json').buildAllPlatforms()

  // build tailwind css props
  styleDictionary.extend('./config/css.json').buildAllPlatforms()

  // build tailwind screens props
  styleDictionary.extend('./config/screens.json').buildAllPlatforms()
})
