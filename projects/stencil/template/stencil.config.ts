import { Config } from '@stencil/core'
import { postcss } from '@stencil/postcss'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'

import { config as baseConfig } from '../../../stencil.config'

const packageName = '{{ componentName }}'
const srcDir = './'

export const config: Config = {
  namespace: packageName,
  ...baseConfig,
}
