import { postcss } from '@stencil/postcss';
import autoprefixer from 'autoprefixer';
import tailwind from 'tailwindcss';
const packageName = 'magma-components';
const srcDir = './src';
export const config = {
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
};
