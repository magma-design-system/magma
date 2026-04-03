import { dirname, join } from 'path'
/* eslint-disable @typescript-eslint/no-require-imports */
// https://www.mokkapps.de/blog/run-build-and-deploy-stencil-and-storybook-from-one-repository
const path = require('path')
const alias = {
  '@dictionary': path.resolve(__dirname, '../src/dictionary/'),
  '@fixture': path.resolve(__dirname, '../src/fixtures/'),
  '@icon': path.resolve(__dirname, '../assets/svg/'),
  '@placeholder': 'https://via.placeholder.com',
  '@test': path.resolve(__dirname, '../src/test/'),
  '@type': path.resolve(__dirname, '../src/types/'),
}
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const stories = [
  '../src/**/*.mdx',
  '../src/**/*.stories.@(js|jsx|ts|tsx)',
]
const staticDirs = ['../assets', '../dist']
const addons = [
  getAbsolutePath('@storybook/addon-a11y'),
  getAbsolutePath('@storybook/addon-styling-webpack'),
  getAbsolutePath('@storybook/addon-webpack5-compiler-babel'),
  getAbsolutePath('@storybook/addon-docs'),
]
const webpackFinal = async config => {
  // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
  // You can change the configuration based on that.
  // 'PRODUCTION' is used when building the static version of storybook.

  config.resolve.alias = {
    ...config.resolve.alias,
    ...alias,
  }
  config.module.rules.push(
    {
      test: /\.ts$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    },
    {
      test: /(\.stories\.tsx|preview\.js)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            sourceType: 'unambiguous',
            babelrc: false,
            presets: [
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
          },
        },
      ],
    },
    {
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                require('postcss-iconsauce')(
                  './.storybook/iconsauce.config.js',
                ),
                require('@tailwindcss/postcss'),
                require('autoprefixer'),
              ],
            },
          },
        },
      ],
      include: path.resolve(__dirname, '../'),
    },
  )
  config.resolve.fallback = {
    crypto: false,
    path: false,
  }
  config.resolve.plugins = config.resolve.plugins || []
  config.resolve.plugins.push(
    new TsConfigPathsPlugin({
      configFile: path.resolve(__dirname, '../tsconfig.json'),
    }),
  )
  return config
}
const framework = { name: getAbsolutePath('@storybook/react-webpack5'), options: { legacyRootApi: true } }
const docs = {}

const config = {
  stories,
  staticDirs,
  addons,
  webpackFinal,
  framework,

  options: {
    storySort: (a, b) => {
      return a.title.localeCompare(b.title, 'it-IT', { numeric: true })
    },
  },

  docs,

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
}

export default config

function getAbsolutePath (value) {
  return dirname(require.resolve(join(value, 'package.json')))
}

