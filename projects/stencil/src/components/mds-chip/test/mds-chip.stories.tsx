import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'

export default {
  title: 'UI / Chip',
  argTypes: {
    clickable: {
      type: { name: 'boolean' },
      description: 'Adds ARIA support to the element if has interaction',
    },
    deletable: {
      type: { name: 'boolean' },
      description: 'Shows the cross icon to perform cancel/delete action on element',
    },
    disabled: {
      type: { name: 'boolean' },
      description: 'Sets the component disabled status',
    },
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon.',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    label: {
      type: { name: 'string' },
      description: 'The label displayed to the right of the component\'s icon',
    },
    selected: {
      type: { name: 'boolean' },
      description: 'Sets the component selected',
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
