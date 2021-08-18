import React from 'react'
import MdsAccordionTimer from '@component/mds-accordion-timer/mds-accordion-timer'
import { typographyPrimaryDictionary } from '@dictionary/typography'
import faker from 'faker'

export default {
  title: 'UI / Accordion Timer',
  component: MdsAccordionTimer,
  argTypes: {
    duration: {
      type: { name: 'number', required: false },
      description: 'Sets the duration of the single accordion item',
    },
  },
}

const Template = args =>
  <div>
    <mds-accordion-timer {...args}>
      <mds-accordion-timer-item active description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-timer-item>
      <mds-accordion-timer-item description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-timer-item>
      <mds-accordion-timer-item description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-timer-item>
      <mds-accordion-timer-item description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-timer-item>
      <mds-accordion-timer-item description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-timer-item>
    </mds-accordion-timer>
  </div>

export const Default = Template.bind({})

export const Duration = Template.bind({})
Duration.args = {
  duration: 1000,
}
