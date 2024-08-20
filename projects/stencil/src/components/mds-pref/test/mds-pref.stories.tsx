import { h } from '@stencil/core'

// import { animationDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Preferences',
  argTypes: {
    mode: {
      type: { name: 'string' },
      // options: animationDictionary,
      // control: { type: 'select' },
      description: 'Specifies the preference mode',
    },
  },
}
const Template = args =>
  <mds-pref {...args}>
    <mds-pref-theme></mds-pref-theme>
    <mds-pref-contrast></mds-pref-contrast>
    <mds-pref-animation></mds-pref-animation>
    <mds-pref-consumption></mds-pref-consumption>
  </mds-pref>

export const Default = Template.bind({})
Default.args = {

}
