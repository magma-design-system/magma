import React from 'react'
import faker from 'faker'

import Accordion, { AccordionItem } from '@Element/Accordion/Accordion'
import Paragraph from '@Typography/Paragraph/Paragraph'

faker.locale = 'it'

export default {
  title: 'Element/Accordion',
  component: Accordion,
}

export const defaultUse = () =>
  <Accordion>
    <AccordionItem title={faker.lorem.sentence()}>
      <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    </AccordionItem>
    <AccordionItem title={faker.lorem.sentence()} isOpened>
      <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    </AccordionItem>
    <AccordionItem title={faker.lorem.sentence()}>
      <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    </AccordionItem>
    <AccordionItem title={faker.lorem.sentence()}>
      <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    </AccordionItem>
  </Accordion>
