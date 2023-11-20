/* eslint-disable @typescript-eslint/no-var-requires */
import StyleDictionary from 'style-dictionary/types'
import cssVarsHex from '../formats/css-vars-hex/css-vars-hex'
import cssVarsRgb from '../formats/css-vars-rgb/css-vars-rgb'
import flutterColor from '../formats/flutter-color/flutter-color'
import flutterFont from '../formats/flutter-font/flutter-font'
import jsModule from '../formats/js/js'
import jsModuleTailwindColors from '../formats/js-tailwind-colors/js-tailwind-colors'
import jsTailwindFontFamily from '../formats/js-tailwind-font-family/js-tailwind-font-family'
import jsTailwindFontSize from '../formats/js-tailwind-font-size/js-tailwind-font-size'
import jsonCoolors from '../formats/json-coolors/json-coolors'

let StyleDictionaryColors: StyleDictionary.Core,
  StyleDictionaryBrand: StyleDictionary.Core,
  StyleDictionaryBrandSynbee: StyleDictionary.Core,
  StyleDictionaryDefault: StyleDictionary.Core,
  StyleDictionaryLabel: StyleDictionary.Core,
  StyleDictionaryStatus: StyleDictionary.Core,
  StyleDictionarySynbeeV1: StyleDictionary.Core,
  StyleDictionaryTones: StyleDictionary.Core

StyleDictionaryColors = jsModule.extend('./config/colors/generated/default.json')
StyleDictionaryColors = jsModuleTailwindColors.extend('./config/colors/generated/default.json')
StyleDictionaryColors = flutterColor.extend('./config/colors/generated/default.json')
StyleDictionaryColors = cssVarsRgb.extend('./config/colors/generated/default.json')
StyleDictionaryColors = cssVarsHex.extend('./config/colors/generated/default.json')
StyleDictionaryColors = jsonCoolors.extend('./config/colors/generated/default.json')
StyleDictionaryColors.buildAllPlatforms()

StyleDictionaryTones = cssVarsHex.extend('./config/colors/generated/tones.json')
StyleDictionaryTones = cssVarsRgb.extend('./config/colors/generated/tones.json')
StyleDictionaryTones.buildAllPlatforms()
StyleDictionaryDefault = cssVarsHex.extend('./config/colors/generated/default.json')
StyleDictionaryDefault = flutterColor.extend('./config/colors/generated/default.json')
StyleDictionaryDefault = cssVarsRgb.extend('./config/colors/generated/default.json')
StyleDictionaryDefault.buildAllPlatforms()
StyleDictionaryBrand = cssVarsHex.extend('./config/colors/generated/brand.json')
StyleDictionaryBrand = cssVarsRgb.extend('./config/colors/generated/brand.json')
StyleDictionaryBrand.buildAllPlatforms()
StyleDictionaryBrandSynbee = cssVarsHex.extend('./config/colors/generated/brand-synbee.json')
StyleDictionaryBrandSynbee = cssVarsRgb.extend('./config/colors/generated/brand-synbee.json')
StyleDictionaryBrandSynbee.buildAllPlatforms()
StyleDictionaryLabel = cssVarsHex.extend('./config/colors/generated/label.json')
StyleDictionaryLabel = cssVarsRgb.extend('./config/colors/generated/label.json')
StyleDictionaryLabel.buildAllPlatforms()
StyleDictionaryStatus = cssVarsHex.extend('./config/colors/generated/status.json')
StyleDictionaryStatus = cssVarsRgb.extend('./config/colors/generated/status.json')
StyleDictionaryStatus.buildAllPlatforms()
StyleDictionarySynbeeV1 = cssVarsHex.extend('./config/colors/generated/synbee-v1.json')
StyleDictionarySynbeeV1 = cssVarsRgb.extend('./config/colors/generated/synbee-v1.json')
StyleDictionarySynbeeV1.buildAllPlatforms()

let StyleDictionaryFontFamily: StyleDictionary.Core = jsTailwindFontFamily.extend('./config/typography/default.json')
StyleDictionaryFontFamily = jsTailwindFontSize.extend('./config/typography/default.json')
StyleDictionaryFontFamily = flutterFont.extend('./config/typography/default.json')
StyleDictionaryFontFamily.buildAllPlatforms()
