import alias from '@rollup/plugin-alias'
import autoprefixer from 'autoprefixer'
import path from 'path'
import tailwind from 'tailwindcss'
import { Config } from '@stencil/core'
import { inlineSvg } from 'stencil-inline-svg'
import { postcss } from '@stencil/postcss'

import { reactOutputTarget } from '@stencil/react-output-target'
import { angularOutputTarget } from '@stencil/angular-output-target'

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
  transformAliasedImportPaths: true,
  srcDir,
  sourceMap: false,
  minifyCss: true,
  minifyJs: true,
  buildEs5: true,
  extras: {
    enableImportInjection: true,
  },
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    angularOutputTarget({
      componentCorePackage: '@maggioli-design-system/magma',
      outputType: 'component',
      directivesProxyFile: './angular/magma-angular/src/stencil-generated/components.ts',
      directivesArrayFile: './angular/magma-angular/src/stencil-generated/index.ts',
    }),
    reactOutputTarget({
      // Relative path to where the React components will be generated
      outDir: './react/src/',
      customElementsDir: 'dist/components',
      // hydrateModule: '@maggioli-design-system/magma/hydrate',
    }),
    {
      type: 'dist-custom-elements',
      // customElementsExportBehavior: 'auto-define-custom-elements',
    },
    // {
    //   type: 'dist-hydrate-script',
    // },
    {
      type: 'docs-readme',
      footer: 'Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)',
    },
    {
      type: 'docs-json',
      file: 'dist/documentation.json',
    },
    {
      type: 'www',
      baseUrl: 'http://localhost:6006/',
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
        autoprefixer({ flexbox: 'no-2009' }),
        tailwind(),
      ],
    }),
    alias({
      entries: [
        { find: /^@common\/(.*)$/, replacement: path.resolve('.', './src/common/$1') },
        { find: /^@component\/(.*)$/, replacement: path.resolve('.', './src/components/$1') },
        { find: /^@dictionary\/(.*)$/, replacement: path.resolve('.', './src/dictionary/$1') },
        { find: /^@event\/(.*)$/, replacement: path.resolve('.', './src/event-detail/$1') },
        { find: /^@fixture\/(.*)$/, replacement: path.resolve('.', './src/fixtures/$1') },
        { find: /^@icon\/([a-zA-Z-\/]+)\.svg$/, replacement: path.resolve(__dirname, './assets/svg/$1.svg') },
        { find: /^@tailwind\/(.*)$/, replacement: path.resolve('.', './src/tailwind/$1') },
        { find: /^@test\/(.+)$/, replacement: path.resolve('.', './src/test/$1') },
        { find: /^@type\/(.+)$/, replacement: path.resolve('.', './src/type/$1') },
      ],
    }),
    inlineSvg(),
  ],
  testing: {
    browserHeadless: 'new',
    /**
     * Gitlab CI doesn't allow sandbox, therefor this parameters must be passed to your Headless Chrome
     * before it can run your tests
     */
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
    coveragePathIgnorePatterns: ['<rootDir>/.build/', '<rootDir>/template/', '<rootDir>/node_modules/'],
    // moduleNameMapper: tsconfigPathsJest(tsconfig),
    moduleNameMapper: {
      '@common/(.*)': '<rootDir>src/common/$1',
      '@dictionary/(.*)': '<rootDir>src/dictionary/$1',
      '@event/(.*)': '<rootDir>src/event-detail/$1',
      '@fixture/(.*)': '<rootDir>src/fixtures/$1',
      '@icon/(.*)': '<rootDir>assets/svg/$1',
      '@placeholder': 'https://via.placeholder.com',
      '@tailwind/(.*)': '<rootDir>src/tailwind/$1',
      '@test/(.*)': '<rootDir>src/test/$1',
      '@type/(.*)': '<rootDir>src/type/$1',
    },
    modulePathIgnorePatterns: ['<rootDir>/.build/', '<rootDir>/template/', '<rootDir>/node_modules/'],
    testPathIgnorePatterns: ['<rootDir>/.cache', '<rootDir>/template/', '<rootDir>/node_modules/', '<rootDir>/.vscode', '/.stencil', '/dist', '/www', '/scripts'],
    transform: { '^.+\\.svg$': 'jest-transformer-svg', '^.+\\.(ts|tsx|js|jsx|css)$': '@stencil/core/testing/jest-preprocessor' },
    transformIgnorePatterns: ['<rootDir>/.build/', '<rootDir>/template/'],
    watchPathIgnorePatterns: ['"^.+\\.d\\.ts$" '],
  },
}
