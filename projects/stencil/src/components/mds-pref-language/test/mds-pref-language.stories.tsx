import { h } from '@stencil/core'

import { languageDictionary, languageListDictionary } from '../meta/dictionary'

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
    { Object.entries(languageListDictionary).map(([key], index) => {
      return <div key={index}>
        <mds-mds-pref-language-item code={key}></mds-mds-pref-language-item>
      </div>
    }) }
  </mds-pref-language>

export const Default = Template.bind({})
Default.args = {

}
