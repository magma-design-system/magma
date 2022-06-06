import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'

export default {
  title: 'Design / Icon',
  argTypes: {
    name: {
      type: { name: 'string' },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-icon {...args}/>

export const Default = Template.bind({})
Default.args = {
  name: 'mdi/alien',
  class: 'fill-label-blue-05',
}

export const ExternalSVG = Template.bind({})
ExternalSVG.args = {
  name: 'https://clayto.com/icons/font-awesome/solid/carrot.svg',
  class: 'fill-label-green-06',
}
