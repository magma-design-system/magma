import React from 'react'
import MdsAccordion from '@component/mds-accordion/mds-accordion'
import faker from 'faker'

export default {
  title: 'UI / Accordion',
  component: MdsAccordion,
  argTypes: {
    multiple: {
      type: { name: 'boolean', required: false },
      description: 'Choose if multiple siblings can be opened simultaneously',
    },
  },
}

const Template = args =>
  <mds-accordion {...args}>
    <mds-accordion-item description={ faker.lorem.sentence() }>
      <mds-text>{ faker.lorem.paragraphs(2) }</mds-text>
    </mds-accordion-item>
    <mds-accordion-item description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-item>
    <mds-accordion-item description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-item>
    <mds-accordion-item description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-item>
    <mds-accordion-item description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-item>
  </mds-accordion>

export const Default = Template.bind({})

export const Multiple = Template.bind({})
Multiple.args = {
  multiple: true,
}
