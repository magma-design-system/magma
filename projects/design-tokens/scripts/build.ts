/* eslint-disable @typescript-eslint/no-var-requires */
const beautify = require('js-beautify').js
import chalk from 'chalk'
import path from 'path'
import { DIST_DIR, CSS_TOKENS_DIR } from './meta'
import { readFile, writeFile } from 'fs/promises'
import { logFileActionDone } from '../../../scripts/log'

import jsModule from '../formats/js/js'
import jsModuleTailwindColors from '../formats/js-tailwind-colors/js-tailwind-colors'
import dartColors from '../formats/dart-colors/dart-colors'
import cssVarsRgb from '../formats/css-vars-rgb/css-vars-rgb'
import cssVarsHex from '../formats/css-vars-hex/css-vars-hex'
import jsonCoolors from '../formats/json-coolors/json-coolors'

const beautifyConfig = {
  indent_size: 2,
  space_in_empty_paren: true,
}

let StyleDictionary, StyleDictionaryDefault, StyleDictionaryBrand, StyleDictionaryBrandSynbee, StyleDictionarySynbeeV1, StyleDictionaryLabel, StyleDictionaryStatus, StyleDictionaryTones
StyleDictionary = jsModule.extend('./config/colors.json')
StyleDictionary = jsModuleTailwindColors.extend('./config/colors.json')
StyleDictionary = dartColors.extend('./config/colors.json')
StyleDictionary = cssVarsRgb.extend('./config/colors.json')
StyleDictionary = cssVarsHex.extend('./config/colors.json')
StyleDictionary = jsonCoolors.extend('./config/colors.json')
StyleDictionary.buildAllPlatforms()
StyleDictionaryTones = cssVarsHex.extend('./config/generated/tones.json')
StyleDictionaryTones = cssVarsRgb.extend('./config/generated/tones.json')
StyleDictionaryTones.buildAllPlatforms()

StyleDictionaryDefault = cssVarsHex.extend('./config/generated/default.json')
StyleDictionaryDefault = dartColors.extend('./config/generated/default.json')
StyleDictionaryDefault = cssVarsRgb.extend('./config/generated/default.json')
StyleDictionaryDefault.buildAllPlatforms()

StyleDictionaryBrand = cssVarsHex.extend('./config/generated/brand.json')
StyleDictionaryBrand = cssVarsRgb.extend('./config/generated/brand.json')
StyleDictionaryBrand.buildAllPlatforms()
StyleDictionaryBrandSynbee = cssVarsHex.extend('./config/generated/brand-synbee.json')
StyleDictionaryBrandSynbee = cssVarsRgb.extend('./config/generated/brand-synbee.json')
StyleDictionaryBrandSynbee.buildAllPlatforms()
StyleDictionaryLabel = cssVarsHex.extend('./config/generated/label.json')
StyleDictionaryLabel = cssVarsRgb.extend('./config/generated/label.json')
StyleDictionaryLabel.buildAllPlatforms()
StyleDictionaryStatus = cssVarsHex.extend('./config/generated/status.json')
StyleDictionaryStatus = cssVarsRgb.extend('./config/generated/status.json')
StyleDictionaryStatus.buildAllPlatforms()
StyleDictionarySynbeeV1 = cssVarsHex.extend('./config/generated/synbee-v1.json')
StyleDictionarySynbeeV1 = cssVarsRgb.extend('./config/generated/synbee-v1.json')
StyleDictionarySynbeeV1.buildAllPlatforms()

const saveAsJs = ({ source, varName, destination }: { source: string, varName: string, destination: string }) => {
  readFile(path.resolve(__dirname, source))
    .then((data: Buffer) => {
      const jsonData = JSON.parse(data.toString())
      const jsData = `
      const ${varName} = ${JSON.stringify(jsonData, null, 4)}
      module.exports = {
        ${varName},
      }
      `
      const jsString = beautify(jsData, beautifyConfig)

      writeFile(destination, jsString)
        .then(() => {
          logFileActionDone({
            entity: 'token',
            source,
            actionDone: 'exported',
            destination,
          })
        })
        .catch(error => {
          throw Error(chalk.red(error))
        })
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

saveAsJs({
  destination: path.join(DIST_DIR, 'js/ease.js'),
  source: path.join(CSS_TOKENS_DIR, 'ease.json'),
  varName: 'ease',
})


saveAsJs({
  destination: path.join(DIST_DIR, 'js/font-family.js'),
  source: path.join(CSS_TOKENS_DIR, 'font-family.json'),
  varName: 'fontFamily',
})

saveAsJs({
  destination: path.join(DIST_DIR, 'js/gap.js'),
  source: path.join(CSS_TOKENS_DIR, 'gap.json'),
  varName: 'gap',
})

saveAsJs({
  destination: path.join(DIST_DIR, 'js/media.js'),
  source: path.join(CSS_TOKENS_DIR, 'media.json'),
  varName: 'media',
})
