import { Config } from '@stencil/core'
import { postcss } from '@stencil/postcss'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'

const packageName = 'magma-components'
const srcDir = './src'

export const config: Config = {
  namespace: packageName,
  taskQueue: 'async',
  srcDir,
  buildEs5: true,
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements-bundle',
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
  ],
  testing: {
    testPathIgnorePatterns: ['<rootDir>/.build/', '<rootDir>/template/', '<rootDir>/node_modules/'],
    watchPathIgnorePatterns: ['<rootDir>/.build/', '<rootDir>/template/', '<rootDir>/node_modules/'],
    coveragePathIgnorePatterns: ['<rootDir>/.build/', '<rootDir>/template/', '<rootDir>/node_modules/'],
    modulePathIgnorePatterns: ['<rootDir>/.build/', '<rootDir>/template/', '<rootDir>/node_modules/'],
    transformIgnorePatterns: ['<rootDir>/.build/', '<rootDir>/template/', '<rootDir>/node_modules/'],
  }
}
