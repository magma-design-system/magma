import { Config } from '@stencil/core'

import { config as baseConfig } from '../../../stencil.config'

const packageName = '{{ componentName }}'
const srcDir = './'

export const config: Config = {
  ...baseConfig,
  namespace: packageName,
  srcDir,
}
