import { h } from '@stencil/core'

import { contrastDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Preferences / Contrast',
  argTypes: {
    mode: {
      type: { name: 'string' },
      options: contrastDictionary,
      control: { type: 'select' },
      description: 'Specifies the preference mode',
    },
  },
}
const Template = args =>
  <mds-pref-contrast {...args}/>

export const Default = Template.bind({})
Default.args = {

}
