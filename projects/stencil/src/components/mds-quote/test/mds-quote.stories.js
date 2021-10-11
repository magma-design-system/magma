import React from 'react'
import faker from 'faker'
import MdsQuote from '@component/mds-quote/mds-quote'
import { typographyPrimaryDictionary } from '@dictionary/typography'

export default {
  title: 'UI / Quote' ,
  component: MdsQuote,
  argTypes: {
    typography: {
      description: 'Specifies the font typography of the element',
      options: typographyPrimaryDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-quote {...args}>
    What one programmer can do in one month, two programmers can do in two months
    <mds-author class="text-adjust-tone-08" slot="author">
      <mds-avatar initials="fb" slot="avatar" class="w-12 bg-brand-maggioli-12" src="./fred-brooks-zoom.webp"/>
      <mds-text typography="h6" class="text-adjust-tone-04">Fred Brooks</mds-text>
      <mds-text typography="caption">Software engineer</mds-text>
    </mds-author>
  </mds-quote>

export const Default = Template.bind({})
export const Typography = Template.bind({})
Typography.args = {
  typography: 'h5',
}
