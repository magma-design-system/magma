import React from 'react'
import faker from 'faker'
import MdsBadge from '@component/mds-badge/mds-badge'
import { typographySecondaryDictionary } from '@dictionary/typography'
import { themeFullVariantDictionary, toneSimpleVariantDictionary } from '@dictionary/variant'
import clsx from 'clsx'

const darkModeDictionary = [
  'none',
  'dark-mode',
  'dark-mode-os',
]

export default {
  title: 'Miscellaneous',
  component: MdsBadge,
  argTypes: {
    darkMode: {
      type: { name: 'string' },
      control: { type: 'select' },
      options: darkModeDictionary,
    },
  },
}

const Template = args =>
  <div className={clsx('grid gap-6 p-6 bg-adjust-tone text-adjust-tone-03', args.darkMode)}>
    <mds-grid class="gap-2">
      <mds-text>To use Dark Mode, You just need to add <mds-text typography="code">dark-mode</mds-text> or <mds-text typography="code">dark-mode-os</mds-text> to your body.</mds-text>
      <mds-text>Selector <mds-text typography="code">dark-mode</mds-text> will simply set Dark Mode for colors.</mds-text>
      <mds-text>Selector <mds-text typography="code">dark-mode-os</mds-text> will set Dark Mode if your OS is set to Dark Mode and your browser supports it.</mds-text>
    </mds-grid>
    <mds-grid class="grid-cols-3 min-w-min">
      <div><mds-badge variant="dark" tone="strong">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="dark" tone="weak">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="dark" tone="quiet">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="light" tone="strong">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="light" tone="weak">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="light" tone="quiet">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="error" tone="strong">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="error" tone="weak">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="error" tone="quiet">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="amaranth" tone="strong">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="amaranth" tone="weak">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="amaranth" tone="quiet">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="orchid" tone="strong">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="orchid" tone="weak">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="orchid" tone="quiet">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="violet" tone="strong">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="violet" tone="weak">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="violet" tone="quiet">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="blue" tone="strong">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="blue" tone="weak">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="blue" tone="quiet">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="sky" tone="strong">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="sky" tone="weak">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="sky" tone="quiet">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="info" tone="strong">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="info" tone="weak">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="info" tone="quiet">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="aqua" tone="strong">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="aqua" tone="weak">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="aqua" tone="quiet">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="success" tone="strong">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="success" tone="weak">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="success" tone="quiet">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="green" tone="strong">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="green" tone="weak">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="green" tone="quiet">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="lime" tone="strong">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="lime" tone="weak">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="lime" tone="quiet">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="yellow" tone="strong">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="yellow" tone="weak">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="yellow" tone="quiet">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="warning" tone="strong">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="warning" tone="weak">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="warning" tone="quiet">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="orange" tone="strong">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="orange" tone="weak">{faker.animal.dog()}</mds-badge></div>
      <div><mds-badge variant="orange" tone="quiet">{faker.animal.dog()}</mds-badge></div>
    </mds-grid>
  </div>

export const DarkMode = Template.bind({})
DarkMode.args = {
  darkMode: 'color-mode--none'
}

