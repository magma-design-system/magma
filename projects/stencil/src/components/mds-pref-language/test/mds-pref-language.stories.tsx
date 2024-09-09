import { h } from '@stencil/core'

import { languageDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Preferences / Language',
  argTypes: {
    mode: {
      type: { name: 'string' },
      options: languageDictionary,
      control: { type: 'select' },
      description: 'Specifies the preference mode',
    },
  },
}
const Template = args =>
  <mds-pref-language {...args}>
    <mds-pref-language-item code="it"></mds-pref-language-item>
    <mds-pref-language-item code="en"></mds-pref-language-item>
    <mds-pref-language-item code="el"></mds-pref-language-item>
  </mds-pref-language>

export const Default = Template.bind({})
Default.args = {

}
