import { Config } from '@stencil/core'
import { config as globalConfig } from '../../../stencil.config'

export const config: Config = {
  ...globalConfig,
  namespace: '{{ componentName }}',
}
