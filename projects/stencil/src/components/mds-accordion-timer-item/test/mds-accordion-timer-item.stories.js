import React from 'react'
import MdsAccordionTimerItem from '@component/mds-accordion-timer-item/mds-accordion-timer-item'
import { typographyPrimaryDictionary } from '@dictionary/typography'
import faker from 'faker'

export default {
  title: 'UI / Accordion Timer / Accordion Timer Item',
  component: MdsAccordionTimerItem,
  argTypes: {
    description: {
      type: { name: 'string', required: true },
      description: 'Specifies the title shown when the accordion is closed or opened',
    },
    active: {
      type: { name: 'boolean', required: false },
      description: 'Specifies if the accordion item is opened or not',
    },
    progress: {
      control: { type: 'range', step: 0.01, min: 0, max: 1 },
      type: { name: 'number', required: false },
      description: 'A value between 0 and 100 that rapresents the status progress',
    },
    typography: {
      type: { name: 'string', required: false },
      description: 'Specifies the typography of the element',
      options: typographyPrimaryDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <div>
    <mds-accordion-timer-item {...args}>
      <mds-text typography="paragraph" class="text-adjust-tone-08">{ faker.lorem.paragraphs(2) }</mds-text>
    </mds-accordion-timer-item>
  </div>

export const Default = Template.bind({})
Default.args = {
  progress: 0.15,
  description: 'Come funziona il monitoraggio del sonno?',
}

export const active = Template.bind({})
active.args = {
  active: true,
  description: 'Come funziona il monitoraggio del sonno?',
}
