import { Config } from '@stencil/core'
import { postcss } from '@stencil/postcss'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import { reactOutputTarget } from '@stencil/react-output-target'

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
      footer: 'Build with love @ **Maggioli Informatica / R&D Department**',
    },
    {
      type: 'www',
      serviceWorker: null,
    },
    {
      type: 'stats',
      file: './dist/stats.json',
    },
    // reactOutputTarget({
    //   componentCorePackage: packageName,
    //   proxiesFile: './dist/react-proxy.tsx',
    //   includeDefineCustomElements: true,
    // }),
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
}
