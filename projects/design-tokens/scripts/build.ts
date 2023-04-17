/* eslint-disable @typescript-eslint/no-var-requires */
const beautify = require('js-beautify').js
import chalk from 'chalk'
import path from 'path'
import { DIST_DIR, CSS_TOKENS_DIR } from './meta'
import { readFile, writeFile } from 'fs/promises'
import { logFileActionDone } from '../../../scripts/log'

import jsModule from '../formats/js-module/js-module'
import jsModuleTailwindConfig from '../formats/js-module-tailwind-config/js-module-tailwind-config'
import dartColors from '../formats/dart-colors/dart-colors'
import cssVarsRgb from '../formats/css-vars-rgb/css-vars-rgb'
import cssVarsHex from '../formats/css-vars-hex/css-vars-hex'
import jsonCoolors from '../formats/json-coolors/json-coolors'

const beautifyConfig = {
  indent_size: 2,
  space_in_empty_paren: true,
}

let StyleDictionary, StyleDictionaryDefault, StyleDictionaryBrand, StyleDictionaryBrandSynbee, StyleDictionarySynbeeV1, StyleDictionaryLabel, StyleDictionaryStatus, StyleDictionaryTones
StyleDictionary = jsModule.extend('./config.json')
StyleDictionary = jsModuleTailwindConfig.extend('./config.json')
StyleDictionary = dartColors.extend('./config.json')
StyleDictionary = cssVarsRgb.extend('./config.json')
StyleDictionary = cssVarsHex.extend('./config.json')
StyleDictionary = jsonCoolors.extend('./config.json')
StyleDictionary.buildAllPlatforms()
StyleDictionaryTones = cssVarsHex.extend('./config/tones.json')
StyleDictionaryTones = cssVarsRgb.extend('./config/tones.json')
StyleDictionaryTones.buildAllPlatforms()

StyleDictionaryDefault = cssVarsHex.extend('./config/default.json')
StyleDictionaryDefault = dartColors.extend('./config/default.json')
StyleDictionaryDefault = cssVarsRgb.extend('./config/default.json')
StyleDictionaryDefault.buildAllPlatforms()

StyleDictionaryBrand = cssVarsHex.extend('./config/brand.json')
StyleDictionaryBrand = cssVarsRgb.extend('./config/brand.json')
StyleDictionaryBrand.buildAllPlatforms()
StyleDictionaryBrandSynbee = cssVarsHex.extend('./config/brand-synbee.json')
StyleDictionaryBrandSynbee = cssVarsRgb.extend('./config/brand-synbee.json')
StyleDictionaryBrandSynbee.buildAllPlatforms()
StyleDictionaryLabel = cssVarsHex.extend('./config/label.json')
StyleDictionaryLabel = cssVarsRgb.extend('./config/label.json')
StyleDictionaryLabel.buildAllPlatforms()
StyleDictionaryStatus = cssVarsHex.extend('./config/status.json')
StyleDictionaryStatus = cssVarsRgb.extend('./config/status.json')
StyleDictionaryStatus.buildAllPlatforms()
StyleDictionarySynbeeV1 = cssVarsHex.extend('./config/synbee-v1.json')
StyleDictionarySynbeeV1 = cssVarsRgb.extend('./config/synbee-v1.json')
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
