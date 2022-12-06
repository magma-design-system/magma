import { h } from '@stencil/core'
// import { h } from 'jsx-dom'
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

// https://design.baloise.dev/?path=/story/components-button--button-states
// https://github.com/baloise/design-system/tree/master/packages/components


// https://dev.to/ofhouse/enhance-your-stencil-web-components-in-storybook-with-knobs-actions-and-jsx-54m4
// "@babel/plugin-syntax-jsx": "^7.18.6",
// "@babel/plugin-transform-react-jsx": "^7.19.0",
// "jsx-dom": "^8.0.3",
