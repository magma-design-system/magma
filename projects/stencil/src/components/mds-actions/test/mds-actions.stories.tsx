import { h } from '@stencil/core'

export default {
  title: 'UI / Actions',
}

const Template = args =>
  <mds-actions {...args}>
    <mds-button icon="mi/baseline/text-format"></mds-button>
    <mds-button icon="mi/baseline/text-rotate-up"></mds-button>
    <mds-button icon="mi/baseline/wrap-text"></mds-button>
  </mds-actions>


export const Default = Template.bind({})
