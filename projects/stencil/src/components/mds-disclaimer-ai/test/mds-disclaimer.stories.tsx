import { h } from '@stencil/core'

import { disclaimerAiDictionary } from '../meta/dictionary'

export default {
  title: 'UI / AI disclaimer',
  argTypes: {
    variant: {
      type: { name: 'string' },
      description: 'Specifies the element variant',
      options: disclaimerAiDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-disclaimer-ai {...args} class="max-w-[400px]"></mds-disclaimer-ai>

const TemplateBanner = args =>
  <mds-disclaimer-ai {...args}></mds-disclaimer-ai>


export const Default = Template.bind({})

export const Icon = Template.bind({})
Icon.args = {
  variant: 'icon',
}
export const Chip = Template.bind({})
Chip.args = {
  variant: 'chip',
}
export const Card = Template.bind({})
Card.args = {
  variant: 'card',
}
export const Banner = TemplateBanner.bind({})
Banner.args = {
  variant: 'banner',
}
