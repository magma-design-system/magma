import { h } from '@stencil/core'

export default {
  title: 'UI / Author',
}

const Template = args =>
  <mds-author {...args}>
    <mds-avatar initials="fb" src="./fred-brooks-zoom.webp" slot="avatar" class="w-2000 bg-brand-maggioli-06"/>
    <mds-text typography="h6">Fred Brooks</mds-text>
    <mds-text typography="caption">Software engineer</mds-text>
    <mds-text typography="caption">IT</mds-text>
  </mds-author>

const TemplateNoAvatar = args =>
  <mds-author {...args}>
    <mds-text typography="h6">Fred Brooks</mds-text>
    <mds-text typography="caption">Software engineer</mds-text>
    <mds-text typography="caption">IT</mds-text>
  </mds-author>

export const Default = Template.bind({})
export const NoAvatar = TemplateNoAvatar.bind({})
