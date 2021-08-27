import React from 'react'
import faker from 'faker'
import MdsBanner from '@component/mds-banner/mds-banner'
import { iconsDictionary } from '@dictionary/icon'
import { bannerVariantDictionary, bannerToneVariantDictionary } from '../meta/dictionary'


export default {
  title: 'UI / Banner',
  component: MdsBanner,
  argTypes: {
    deletable: {
      type: { name: 'boolean', required: false },
      description: 'Shows the cross icon to perform cancel/delete action on element',
    },
    headline: {
      type: { name: 'string', required: false },
      description: 'The title on the top of the banner',
    },
    icon: {
      type: { name: 'string', required: true },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    tone: {
      type: { name: 'string', required: false },
      description: 'Specifies the tone variant of the banner',
      options: bannerToneVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string', required: false },
      description: 'Specifies the variant of the banner',
      options: bannerVariantDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-banner {...args}>
    { faker.lorem.paragraph() }
  </mds-banner>

const TemplateActions = args =>
  <mds-banner {...args}>
    { faker.lorem.paragraph() }
    <mds-button slot="actions" variant={args.variant} tone="weak">{ faker.hacker.verb() }</mds-button>
    <mds-button slot="actions" variant={args.variant}>{ faker.hacker.verb() }</mds-button>
  </mds-banner>

export const Default = Template.bind({})

export const Headline = Template.bind({})
Headline.args = {
  headline: faker.animal.dog(),
}

export const Icon = Template.bind({})
Icon.args = {
  icon: 'status-warning',
}

export const Deletable = Template.bind({})
Deletable.args = {
  deletable: true,
}

export const Actions = TemplateActions.bind({})

export const Variant = TemplateActions.bind({})
Variant.args = {
  variant: 'success',
}
