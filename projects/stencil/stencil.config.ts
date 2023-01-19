import alias from '@rollup/plugin-alias'
import autoprefixer from 'autoprefixer'
import path from 'path'
import tailwind from 'tailwindcss'
import { Config } from '@stencil/core'
import { inlineSvg } from 'stencil-inline-svg'
import { postcss } from '@stencil/postcss'

// https://github.com/ionic-team/stencil/issues/1307
// still not working
// import tsconfigPathsJest from 'tsconfig-paths-jest'
// import tsconfig from './tsconfig.json'
// console.log(tsconfig)

const packageName = 'magma-components'
const srcDir = './src'

export const config: Config = {
  namespace: packageName,
  hydratedFlag: {
    selector: 'attribute',
  },
  taskQueue: 'async',
  srcDir,
  buildEs5: true,
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
      footer: 'Built with love @ **Maggioli Informatica / R&D Department**',
    },
    {
      type: 'www',
      serviceWorker: null,
    },
    {
      type: 'stats',
      file: './dist/stats.json',
    },
  ],
  plugins: [
    postcss({
      plugins: [
        autoprefixer({
          flexbox: 'no-2009',
        }),
        tailwind(),
      ],
    }),
    alias({
      entries: [
        { find: /^@common\/(.*)+$/, replacement: path.resolve('.', './src/common/$1') },
        { find: /^@component\/(.*)+$/, replacement: path.resolve('.', './dist/collection/components/$1') },
        { find: /^@dictionary\/(.*)+$/, replacement: path.resolve('.', './src/dictionary/$1') },
        { find: /^@fixture\/(.*)+$/, replacement: path.resolve('.', './src/fixtures/$1') },
        { find: /^@icon\/([a-zA-Z-\/]+)\.svg$/, replacement: path.resolve(__dirname, './assets/svg/$1.svg') },
        { find: /^@test\/(.*)+$/, replacement: path.resolve('.', './src/test/$1') },
        { find: /^@type\/(.*)+$/, replacement: path.resolve('.', './src/types/$1') },
      ]
    }),
    inlineSvg(),
  ],
  testing: {
    /**
     * Gitlab CI doesn't allow sandbox, therefor this parameters must be passed to your Headless Chrome
     * before it can run your tests
     */
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
    coveragePathIgnorePatterns: ['<rootDir>/.build/', '<rootDir>/template/', '<rootDir>/node_modules/'],
    // moduleNameMapper: tsconfigPathsJest(tsconfig),
    moduleNameMapper: {
      '@common/(.*)': '<rootDir>src/common/$1',
      '@component/(.*)': '<rootDir>dist/collection/components/$1',
      '@dictionary/(.*)': '<rootDir>src/dictionary/$1',
      '@fixture/(.*)': '<rootDir>src/fixtures/$1',
      '@icon/(.*)': '<rootDir>assets/svg/$1',
      '@placeholder': 'https://via.placeholder.com',
      '@test/(.*)': '<rootDir>src/test/$1',
      '@type/(.*)': '<rootDir>src/types/$1',
    },
    modulePathIgnorePatterns: ['<rootDir>/.build/', '<rootDir>/template/', '<rootDir>/node_modules/'],
    testPathIgnorePatterns: ['<rootDir>/.build/', '<rootDir>/template/', '<rootDir>/node_modules/'],
    transform: { "^.+\\.svg$": "jest-transformer-svg" },
    transformIgnorePatterns: ['<rootDir>/.build/', '<rootDir>/template/', '<rootDir>/node_modules/'],
    watchPathIgnorePatterns: ['<rootDir>/.build/', '<rootDir>/template/', '<rootDir>/node_modules/'],
  }
}
