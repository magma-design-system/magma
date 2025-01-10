import { h } from '@stencil/core'

export default {
  title: 'UI / Tree',
  argTypes: {
    label: {
      type: { name: 'string' },
      description: 'Specifies where the component should be placed relative to the caller',
    },
  },
}

const Template = ({ ...args }) =>
  <mds-tree {...args}>
    <mds-tree label="Sub element"></mds-tree>
  </mds-tree>

export const Default = Template.bind({})
Default.args = {
  label: '1.2.0 - Denominazione, territorio, Circoscrizione di decentralizzazione, Toponomastica',
}
