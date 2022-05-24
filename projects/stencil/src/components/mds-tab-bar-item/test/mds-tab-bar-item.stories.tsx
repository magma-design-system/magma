
import { typographySmallerDictionary } from '@dictionary/typography'
import { h } from '@stencil/core'

export default {
  title: 'UI / Tab Bar / Tab Bar Item',
  argTypes: {
    selected: {
      type: { name: 'boolean' },
      description: 'Specifies if the component item is selected or not',
    },
    typography: {
      type: { name: 'string' },
      description: 'Specifies the typography of the element',
      options: typographySmallerDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-tab-bar>
    <mds-tab-bar-item {...args} icon="mdi/barley" selected>First Blood</mds-tab-bar-item>
    <mds-tab-bar-item {...args} icon="mdi/crown">Second Impact</mds-tab-bar-item>
    <mds-tab-bar-item {...args} icon="mi/baseline/timer">The Third Reich</mds-tab-bar-item>
    <mds-tab-bar-item {...args} icon="mi/baseline/account-balance">The Fantastic Four</mds-tab-bar-item>
    <mds-tab-bar-item {...args} icon="mi/baseline/account-balance-wallet">The Fifth Element</mds-tab-bar-item>
  </mds-tab-bar>

export const Default = Template.bind({})
