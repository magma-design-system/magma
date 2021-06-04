import { Config } from '@stencil/core'
import { postcss } from '@stencil/postcss'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'

// import { angularOutputTarget, ValueAccessorConfig } from '@stencil/angular-output-target';

// const angularValueAccessorBindings: ValueAccessorConfig[] = [
//   // https://github.com/ionic-team/stencil-ds-output-targets/issues/6
//   {
//     elementSelectors: ['my-input[type=text]'],
//     event: 'myChange',
//     targetAttr: 'value',
//     type: 'text',
//   },
//   {
//     elementSelectors: ['my-input[type=number]'],
//     event: 'myChange',
//     targetAttr: 'value',
//     type: 'number',
//   },
//   {
//     elementSelectors: ['my-checkbox'],
//     event: 'myChange',
//     targetAttr: 'checked',
//     type: 'boolean',
//   },
//   {
//     elementSelectors: ['my-radio'],
//     event: 'mySelect',
//     targetAttr: 'checked',
//     type: 'radio',
//   },
//   {
//     elementSelectors: ['my-range', 'my-radio-group'],
//     event: 'myChange',
//     targetAttr: 'value',
//     type: 'select',
//   },
// ];

export const config: Config = {
  namespace: 'stencil-components',
  taskQueue: 'async',
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
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
    // angularOutputTarget({
    //   componentCorePackage: 'stencil-components',
    //   directivesProxyFile: './directives/proxies.ts', //'../component-library-angular/src/directives/proxies.ts',
    //   valueAccessorConfigs: angularValueAccessorBindings,
    // }),
    {
      type: 'dist',
    },
  ],
  plugins: [
    postcss({
      plugins: [
        autoprefixer(),
        tailwind(),
      ]
    })
  ]
};
