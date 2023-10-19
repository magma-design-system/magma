import { mergeConfig, UserConfig } from 'vite'
import { resolve } from 'path'
import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: [
    '../components/mds-*/src/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  core: {
    builder: '@storybook/builder-vite',
  },
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  features: {
    storyStoreV7: false
  },
  async viteFinal(config, {
    configType
  }) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@component/*': resolve(__dirname, '../components/*'),
          '@placeholder': resolve(__dirname, 'https://via.placeholder.com'),
          '@stencil-common/*': resolve(__dirname, '../../stencil/src/common/*'),
          '@stencil-dist/*': resolve(__dirname, '../../stencil/dist/*'),
          '@stencil-component/*': resolve(__dirname, '../../stencil/src/components/*'),
          '@stencil-dictionary': resolve(__dirname, '../../stencil/src/dictionary/'),
          '@stencil-fixture/*': resolve(__dirname, '../../stencil/src/fixtures/*'),
          '@stencil-icon/*': resolve(__dirname, '../../stencil/assets/svg/*'),
          '@stencil-interface/*': resolve(__dirname, '../../stencil/src/interface/*'),
          '@stencil-type/*': resolve(__dirname, '../../stencil/src/type/*'),
        }
      }
    })
  },
  docs: {
    autodocs: true
  },
  staticDirs : [
    resolve(__dirname, '../../stencil/assets'),
    resolve(__dirname, '../../stencil/dist'),
  ],
}

export default config
