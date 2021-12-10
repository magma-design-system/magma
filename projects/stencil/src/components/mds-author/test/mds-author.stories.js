import React from 'react'
import MdsAuthor from '@component/mds-author/mds-author'

export default {
  title: 'UI / Author',
  component: MdsAuthor,
}

const Template = args =>
  <mds-author {...args} class="text-adjust-tone-04">
    <mds-avatar initials="fb" src="./fred-brooks-zoom.webp" slot="avatar" class="w-20 bg-brand-maggioli-06"/>
    <mds-text typography="h6" class="text-adjust-tone-02">Fred Brooks</mds-text>
    <mds-text typography="caption">Software engineer</mds-text>
    <mds-text typography="caption">IT</mds-text>
  </mds-author>

export const Default = Template.bind({})
