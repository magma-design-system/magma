import { h } from '@stencil/core'

export default {
  title: 'UI / Author',
}

const Template = args =>
  <mds-author {...args} class="text-tone-neutral-04">
    <mds-avatar initials="fb" src="./fred-brooks-zoom.webp" slot="avatar" class="w-20 bg-brand-maggioli-06"/>
    <mds-text typography="h6" class="text-tone-neutral-02">Fred Brooks</mds-text>
    <mds-text typography="caption">Software engineer</mds-text>
    <mds-text typography="caption">IT</mds-text>
  </mds-author>

export const Default = Template.bind({})
