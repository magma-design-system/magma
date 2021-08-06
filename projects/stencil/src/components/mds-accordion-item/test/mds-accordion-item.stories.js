import React from 'react'
import MdsAccordionItem from '@component/mds-accordion-item/mds-accordion-item'
import { typographyPrimaryDictionary } from '@dictionary/typography'
import faker from 'faker'

export default {
  title: 'UI / Accordion / Accordion Item',
  component: MdsAccordionItem,
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
  <div>
    <mds-accordion-item {...args}>
      <mds-text typography="paragraph" class="text-adjust-tone-08">{ faker.lorem.paragraphs(2) }</mds-text>
    </mds-accordion-item>
  </div>

export const Default = Template.bind({})
Default.args = {
  description: 'Come funziona il monitoraggio del sonno?',
}

export const opened = Template.bind({})
opened.args = {
  opened: true,
  description: 'Come funziona il monitoraggio del sonno?',
}
