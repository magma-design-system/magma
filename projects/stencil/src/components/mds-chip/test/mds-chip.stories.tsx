import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'

// deletable
// disabled
// icon

export default {
  title: 'UI / Chip',
  argTypes: {
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon.',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    clickable: {
      type: { name: 'boolean' },
      description: 'Sets the tone of the color variant',
    },
    deletable: {
      type: { name: 'boolean' },
      description: 'Sets the tone of the color variant',
    },
    disabled: {
      type: { name: 'boolean' },
      description: 'Sets the tone of the color variant',
    },
  },
}

const Template = args =>
  <mds-chip {...args} onDelete={(e: MouseEvent) => { console.log('onDelete', e) }} onLabelClick={(e: MouseEvent) => { console.log('onLabelClick', e) }}/>

export const Default = Template.bind( {} )
Default.args = {
  deletable: true,
  clickable: true,
  onLabelClick: (e: MouseEvent) => { console.log('onLabelClick', e) },
  onDelete: (e: MouseEvent) => { console.log('onDelete', e) },
  label: 'Bovaro del Bernese',
  icon: 'mi/baseline/eco',
}

// https://design.baloise.dev/?path=/story/components-button--button-states
// https://github.com/baloise/design-system/tree/master/packages/components

// Default.addEventListener('onLabelClick', (e: MouseEvent) => { console.log('onLabelClick', e) })
// Default.addEventListener('onDelete', (e: MouseEvent) => { console.log('onDelete', e) })

