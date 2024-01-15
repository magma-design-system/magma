import { typographyReadDictionary } from '@dictionary/typography'
import { h } from '@stencil/core'

export default {
  title: 'UI / Quote',
  argTypes: {
    typography: {
      description: 'Specifies the font typography of the element',
      options: typographyReadDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-quote {...args}>
    What one programmer can do in one month, two programmers can do in two months
    <mds-author class="text-tone-neutral-04" slot="author">
      <mds-avatar initials="fb" slot="avatar" class="w-1200 bg-brand-maggioli-12" src="./fred-brooks-zoom.webp"/>
      <mds-text typography="h6" class="text-tone-neutral-02">Fred Brooks</mds-text>
      <mds-text typography="caption">Software engineer</mds-text>
    </mds-author>
  </mds-quote>

export const Default = Template.bind({})
export const Typography = Template.bind({})
Typography.args = {
  typography: 'h5',
}
