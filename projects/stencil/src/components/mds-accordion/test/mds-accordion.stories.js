import React from 'react'
import MdsAccordion from '@component/mds-accordion/mds-accordion'
import { typographyPrimaryDictionary } from '@dictionary/typography'
import faker from 'faker'

export default {
  title: 'UI / Accordion / Accordion',
  component: MdsAccordion,
  argTypes: {
    description: {
      type: { name: 'string', required: true },
      description: 'Specifies the title shown when the accordion is closed or opened',
    },
    opened: {
      type: { name: 'boolean', required: false },
      description: 'Specifies if the accordion item is opened or not',
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
  <mds-accordion {...args}>
    <mds-accordion-item description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-item>
    <mds-accordion-item description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-item>
    <mds-accordion-item description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-item>
    <mds-accordion-item description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-item>
    <mds-accordion-item description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-item>
  </mds-accordion>

export const Default = Template.bind({})
Default.args = {
  description: 'Come funziona il monitoraggio del sonno?',
}
