import { h } from '@stencil/core'

import { consumptionDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Preferences / Consumption',
  argTypes: {
    mode: {
      type: { name: 'string' },
      options: consumptionDictionary,
      control: { type: 'select' },
      description: 'Specifies the preference mode',
    },
  },
}
const Template = args =>
  <mds-pref-consumption {...args}/>

export const Default = Template.bind({})
Default.args = {

}
