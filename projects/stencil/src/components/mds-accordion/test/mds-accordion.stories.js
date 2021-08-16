import React from 'react'
import MdsAccordion from '@component/mds-accordion/mds-accordion'
import { typographyPrimaryDictionary } from '@dictionary/typography'
import faker from 'faker'

export default {
  title: 'UI / Accordion / Accordion',
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
    <mds-accordion-item description={ faker.lorem.sentence() }>
      <mds-img src="/howls-moving-castle-01-1024x768.jpg"/>
      <mds-text>{ faker.lorem.paragraphs(2) }</mds-text>
    </mds-accordion-item>
    <mds-accordion-item description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-item>
    <mds-accordion-item description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-item>
    <mds-accordion-item description={ faker.lorem.sentence() }><mds-text>{ faker.lorem.paragraphs(2) }</mds-text></mds-accordion-item>
  </mds-accordion>

export const Default = Template.bind({})
Default.args = {
  description: 'Come funziona il monitoraggio del sonno?',
}
