import StyleDictionary, { DesignTokens } from 'style-dictionary';

export function getStyleDictionaryColorConfigAllPlatforms(
  inputTokens: string[] | DesignTokens,
  outputDir?: string,
): StyleDictionary.Config {
  const buildPath = outputDir ?? 'dist';
  let source, tokens;
  if (typeof inputTokens === 'object') {
    tokens = inputTokens as DesignTokens;
  } else {
    source = tokens;
  }
  return {
    source,
    tokens,
    platforms: {
      js: {
        transformGroup: 'js',
        buildPath: `${buildPath}/js/`,
        files: [
          {
            destination: 'colors-css-vars.js',
            format: 'js/module',
          },
          {
            destination: 'tailwind-colors-css-vars.js',
            format: 'js/tailwind-colors',
          },
        ],
      },

      dart: {
        transformGroup: 'js',
        buildPath: `${buildPath}/flutter/`,
        files: [
          {
            destination: 'colors.dart',
            format: 'flutter/color',
          },
        ],
      },

      json: {
        transformGroup: 'js',
        buildPath: `${buildPath}/json/`,
        files: [
          {
            destination: 'coolors.json',
            format: 'json/coolors',
          },
        ],
      },

      gimp: {
        transformGroup: 'js',
        buildPath: `${buildPath}/gimp/`,
        files: [
          {
            destination: 'colors.gpl',
            format: 'gimp/palette',
          },
        ],
      },

      scss: {
        transformGroup: 'scss',
        buildPath: `${buildPath}/scss/`,
        files: [
          {
            destination: 'variables.scss',
            format: 'scss/map-deep',
          },
        ],
      },

      css: {
        transformGroup: 'css',
        buildPath: `${buildPath}/css/`,
        files: [
          {
            format: 'css/vars',
            destination: 'colors-hex.css',
          },
          {
            format: 'css/vars-rgb-channels',
            destination: 'colors-rgb.css',
          },
          {
            format: 'css/css-tailwind-theme-color',
            destination: 'tailwind-theme-color.css',
          },
        ],
      },

      android: {
        transformGroup: 'android',
        buildPath: `${buildPath}/android/`,
        files: [
          {
            destination: 'colors.xml',
            format: 'android/colors',
          },
        ],
      },

      ios: {
        transformGroup: 'ios',
        buildPath: `${buildPath}/ios/`,
        files: [
          {
            destination: 'StyleDictionaryColor.h',
            format: 'ios/colors.h',
            className: 'StyleDictionaryColor',
            filter: {
              attributes: {
                category: 'color',
              },
            },
          },
          {
            destination: 'StyleDictionaryColor.m',
            format: 'ios/colors.m',
            className: 'StyleDictionaryColor',
            filter: {
              attributes: {
                category: 'color',
              },
            },
          },
        ],
      },
      'ios-swift': {
        transformGroup: 'ios-swift',
        buildPath: `${buildPath}/ios-swift/`,
        files: [
          {
            destination: 'StyleDictionary.swift',
            format: 'ios-swift/class.swift',
            className: 'StyleDictionary',
            filter: {},
          },
        ],
      },
      'ios-swift-separate-enums': {
        transformGroup: 'ios-swift-separate',
        buildPath: `${buildPath}/ios-swift/`,
        files: [
          {
            destination: 'StyleDictionaryColor.swift',
            format: 'ios-swift/enum.swift',
            className: 'StyleDictionaryColor',
            filter: {
              attributes: {
                category: 'color',
              },
            },
          },
        ],
      },
    },
  };
}
