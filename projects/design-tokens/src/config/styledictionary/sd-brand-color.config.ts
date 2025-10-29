import StyleDictionary, { DesignToken } from 'style-dictionary'

export function getBrandColorConfig (fileName: string, inputTokens: string[] | DesignToken,
  outputDir?: string): StyleDictionary.Config {
  const buildPath = outputDir ?? 'dist'
  let source, tokens
  if (typeof inputTokens === 'object') {
    tokens = inputTokens
  } else {
    source = tokens
  }
  return {
    source,
    tokens,
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: `${buildPath}/css/`,
        files: [
          {
            format: 'css/vars',
            destination: `colors-hex-${fileName}.css`,
          },
          {
            format: 'css/vars-rgb-channels',
            destination: `colors-rgb-${fileName}.css`,
          },
        ],
      },
      dart: {
        transformGroup: 'js',
        buildPath: `${buildPath}/flutter/`,
        files: [
          {
            destination: `colors-${fileName}.dart`,
            format: 'flutter/color',
          },
        ],
      },
      tailwind: {
        transformGroup: 'js',
        buildPath: `${buildPath}/tailwind/`,
        files: [
          {
            destination: `colors-${fileName}.js`,
            format: 'js/tailwind-colors',
          },
        ],
      },
    },
  }
}
