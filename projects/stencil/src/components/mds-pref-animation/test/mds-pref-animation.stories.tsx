import { h } from '@stencil/core'

import { animationDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Preferences / Animation',
  argTypes: {
    mode: {
      type: { name: 'string' },
      options: animationDictionary,
      control: { type: 'select' },
      description: 'Specifies the preference mode',
    },
  },
}
const Template = args =>
  <mds-pref-animation {...args}/>

export const Default = Template.bind({})
Default.args = {

}
