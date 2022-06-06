/* eslint-disable @typescript-eslint/no-var-requires */
const beautify = require('js-beautify').js
import chalk from 'chalk'
import path from 'path'
import { DIST_DIR, CSS_TOKENS_DIR } from './meta'
import { readFile, writeFile } from 'fs/promises'
import { logFileActionDone } from '../../../scripts/log'

const beautifyConfig = {
  indent_size: 2,
  space_in_empty_paren: true,
}

let StyleDictionary, StyleDictionaryBrand, StyleDictionaryBrandSynbee, StyleDictionaryLabel, StyleDictionaryStatus, StyleDictionaryTones
StyleDictionary = require('../formats/js-module/js-module').extend('./config.json')
StyleDictionary = require('../formats/js-module-tailwind-config/js-module-tailwind-config').extend('./config.json')
StyleDictionary = require('../formats/css-vars/css-vars').extend('./config.json')
StyleDictionary = require('../formats/css-vars-rgb-channels/css-vars-rgb-channels').extend('./config.json')
StyleDictionary.buildAllPlatforms()
StyleDictionaryTones = require('../formats/css-vars/css-vars').extend('./config/tones.json')
StyleDictionaryTones = require('../formats/css-vars-rgb-channels/css-vars-rgb-channels').extend('./config/tones.json')
StyleDictionaryTones.buildAllPlatforms()
StyleDictionaryBrand = require('../formats/css-vars/css-vars').extend('./config/brand.json')
StyleDictionaryBrand = require('../formats/css-vars-rgb-channels/css-vars-rgb-channels').extend('./config/brand.json')
StyleDictionaryBrand.buildAllPlatforms()
StyleDictionaryBrandSynbee = require('../formats/css-vars/css-vars').extend('./config/brand-synbee.json')
StyleDictionaryBrandSynbee = require('../formats/css-vars-rgb-channels/css-vars-rgb-channels').extend('./config/brand-synbee.json')
StyleDictionaryBrandSynbee.buildAllPlatforms()
StyleDictionaryLabel = require('../formats/css-vars/css-vars').extend('./config/label.json')
StyleDictionaryLabel = require('../formats/css-vars-rgb-channels/css-vars-rgb-channels').extend('./config/label.json')
StyleDictionaryLabel.buildAllPlatforms()
StyleDictionaryStatus = require('../formats/css-vars/css-vars').extend('./config/status.json')
StyleDictionaryStatus = require('../formats/css-vars-rgb-channels/css-vars-rgb-channels').extend('./config/status.json')
StyleDictionaryStatus.buildAllPlatforms()

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
  destination: path.join(DIST_DIR, 'js/media.js'),
  source: path.join(CSS_TOKENS_DIR, 'media.json'),
  varName: 'media',
})

saveAsJs({
  destination: path.join(DIST_DIR, 'js/font-family.js'),
  source: path.join(CSS_TOKENS_DIR, 'font-family.json'),
  varName: 'fontFamily',
})
