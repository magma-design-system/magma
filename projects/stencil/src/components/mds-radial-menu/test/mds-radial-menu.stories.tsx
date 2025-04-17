import { h } from '@stencil/core'
import {
  buttonSizeDictionary,
} from '@dictionary/button'
import { directionDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Radial Menu',
  argTypes: {
    'angle-start': {
      type: { name: 'number' },
      description: 'Specifies the angle start',
    },
    'angle-end': {
      type: { name: 'number' },
      description: 'Specifies the angle end',
    },
    'radius-length': {
      type: { name: 'number' },
      description: 'Specifies the length of the radius in rem',
    },
    direction: {
      type: { name: 'string' },
      description: 'Specifies the direction',
      options: directionDictionary,
      control: { type: 'select' },
    },
    opened: {
      type: { name: 'boolean' },
      description: 'Specifies the opened',
    },
    size: {
      type: { name: 'string' },
      description: 'Specifies the size of the button',
      options: buttonSizeDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <div class="min-h-dvh flex items-center justify-center">
    <mds-radial-menu {...args}>
      <mds-radial-menu-item icon='mi/baseline/favorite' variant='primary'></mds-radial-menu-item>
      <mds-radial-menu-item icon='mi/baseline/email' variant='primary'></mds-radial-menu-item>
      <mds-radial-menu-item icon='mi/baseline/insert-drive-file' variant='primary'></mds-radial-menu-item>
      <mds-radial-menu-item icon='mi/baseline/info' variant='success'></mds-radial-menu-item>
      <mds-radial-menu-item icon='mi/baseline/info'></mds-radial-menu-item>
      <mds-radial-menu-item icon='mi/baseline/info'></mds-radial-menu-item>
      <mds-radial-menu-item icon='mi/baseline/info' variant='error'></mds-radial-menu-item>
      <mds-radial-menu-item icon='mi/baseline/info' variant='error'></mds-radial-menu-item>
    </mds-radial-menu>
  </div>

export const Default = Template.bind({})
Default.args = {
  'angle-start': 0,
  'angle-end': 360,
  'radius-length': 5,
  direction: 'clockwise',
  opened: false,
  size: 'lg',
}
