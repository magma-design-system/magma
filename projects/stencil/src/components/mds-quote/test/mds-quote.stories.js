import React from 'react'
import faker from 'faker'
import MdsQuote from '@component/mds-quote/mds-quote'

export default {
  title: 'UI / Quote' ,
  component: MdsQuote,
  argTypes: {},
}

const Template = args =>
  <mds-quote {...args}>
    What one programmer can do in one month, two programmers can do in two months
  </mds-quote>

const TemplateAuthor = args =>
  <mds-quote {...args}>
    What one programmer can do in one month, two programmers can do in two months
    <mds-author {...args} class="text-adjust-tone-08" slot="author">
      <mds-avatar initials="fb" slot="avatar" class="w-20 bg-brand-maggioli-12"/>
      <mds-text typography="h6" class="text-adjust-tone-04">Fred Brooks</mds-text>
      <mds-text typography="caption">Software engineer</mds-text>
    </mds-author>
  </mds-quote>

export const Default = Template.bind({})
Default.args = {
  author: 'Fred Brooks',
  role: 'Software engineer',
}
