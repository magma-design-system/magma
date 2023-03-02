import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'

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
  <mds-chip {...args}
    onDelete={() => { console.log('onDelete') }}
  />

export const Default = Template.bind({})
Default.args = {
  label: 'Bovaro del Bernese',
}

export const Icon = Template.bind({})
Icon.args = {
  label: 'Bovaro del Bernese',
  icon: 'mi/baseline/eco',
}

export const deletable = Template.bind({})
deletable.args = {
  deletable: true,
  label: 'Bovaro del Bernese',
}

export const clickable = Template.bind({})
clickable.args = {
  clickable: true,
  label: 'Hover me to interact',
}

export const fullyInteractive = Template.bind({})
fullyInteractive.args = {
  clickable: true,
  deletable: true,
  icon: 'mi/baseline/downhill-skiing',
  label: 'Downhill skiing',
}
