import React from 'react'
import faker from 'faker'
import clsx from 'clsx'
import MdsBanner from '@component/mds-banner/mds-banner'
import { iconsDictionary } from '@dictionary/icon'
import { themeVariantDictionary, toneVariantDictionary } from '@dictionary/variant'

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
      description: 'Sets the tone of the color variant',
      options: toneVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string', required: false },
      description: 'Sets the theme variant colors',
      options: themeVariantDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-banner {...args}>
    <mds-text typography="detail">
      { faker.lorem.paragraph() }
    </mds-text>
  </mds-banner>

const TemplateActions = args =>
  <div class={clsx(args.tone === 'quiet' && args.variant === 'light' ? 'bg-adjust-tone-01' : 'bg-adjust-tone-10', 'p-4 transition-colors delay-300')}>
    <mds-banner {...args}>
      <mds-text typography="detail">
        { faker.lorem.paragraph() }
      </mds-text>
      <mds-button slot="actions" variant={args.variant} tone="ghost">{ faker.hacker.verb() }</mds-button>
      <mds-button slot="actions" variant={args.variant}>{ faker.hacker.verb() }</mds-button>
    </mds-banner>
  </div>

export const Default = Template.bind({})

export const Headline = Template.bind({})
Headline.args = {
  headline: faker.animal.dog(),
}

export const Icon = Template.bind({})
Icon.args = {
  icon: 'warning',
}

export const Deletable = Template.bind({})
Deletable.args = {
  deletable: true,
}

export const Actions = TemplateActions.bind({})

export const Variant = TemplateActions.bind({})
Variant.args = {
  headline: faker.animal.dog(),
  icon: 'warning',
  deletable: true,
  variant: 'warning',
}
