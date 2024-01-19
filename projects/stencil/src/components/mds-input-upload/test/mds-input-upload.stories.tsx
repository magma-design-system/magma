import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'
// import { themeFullVariantAvatarDictionary, toneMinimalVariantDictionary } from '@dictionary/variant'

export default {
  title: 'Form / Input Upload',
  argTypes: {
    icon: {
      type: { name: 'string' },
      description: 'Specifies the icon to be displayed if src propery is not used',
      options: iconsDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <div>
    <mds-input-upload {...args}></mds-input-upload>
  </div>

export const Default = Template.bind({})
Default.args = {
  // icon: 'mi/baseline/email',
}
