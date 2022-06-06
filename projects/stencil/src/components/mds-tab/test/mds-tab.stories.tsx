import { h } from '@stencil/core'

export default {
  title: 'UI / Tab',
}

const Template = args =>
  <mds-tab {...args}>
    <mds-tab-item selected class="mobile:flex-1">First Blood</mds-tab-item>
    <mds-tab-item class="mobile:flex-1">Second Impact</mds-tab-item>
    <mds-tab-item class="mobile:flex-1">The Third Reich</mds-tab-item>
  </mds-tab>

export const Default = Template.bind({})
