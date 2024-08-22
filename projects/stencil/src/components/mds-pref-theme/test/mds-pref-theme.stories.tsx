import { h } from '@stencil/core'
import { themeModeDictionary, transitionDictionary } from '../meta/dictionary'


export default {
  title: 'UI / Preferences / Theme',
  argTypes: {
    mode: {
      type: { name: 'string' },
      options: themeModeDictionary,
      control: { type: 'select' },
      description: 'Specifies the preference mode',
    },
    transition: {
      type: { name: 'string' },
      options: transitionDictionary,
      control: { type: 'select' },
      description: 'Specifies the transition of switching from a theme to another one',
    },
  },
}
const Template = args =>
  <mds-pref-theme {...args}/>

export const Default = Template.bind({})
Default.args = {

}
