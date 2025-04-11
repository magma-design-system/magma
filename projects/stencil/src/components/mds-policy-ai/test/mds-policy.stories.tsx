import { h } from '@stencil/core'

import { policyAiDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Policy AI',
  argTypes: {
    variant: {
      type: { name: 'string' },
      description: 'Specifies the element variant',
      options: policyAiDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-policy-ai {...args} class="max-w-[400px]"></mds-policy-ai>

const TemplateBanner = args =>
  <mds-policy-ai {...args}></mds-policy-ai>


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
