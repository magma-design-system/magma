import React from 'react'
import faker from 'faker'
import randomIcon from '@Design/Icon/faker'
import Accordion, { AccordionItem } from '@UI/Accordion/Accordion'
import Paragraph from '@Typography/Paragraph/Paragraph'

faker.locale = 'it'

export default {
  title: 'UI/Accordion',
  component: Accordion,
}

export const defaultUsage = () =>
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

export const customIcon = () =>
  <Accordion>
    <AccordionItem icon={randomIcon()} title={faker.lorem.sentence()}>
      <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    </AccordionItem>
    <AccordionItem icon={randomIcon()} title={faker.lorem.sentence()} isOpened>
      <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    </AccordionItem>
    <AccordionItem icon={randomIcon()} title={faker.lorem.sentence()}>
      <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    </AccordionItem>
    <AccordionItem icon={randomIcon()} title={faker.lorem.sentence()}>
      <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    </AccordionItem>
  </Accordion>

export const accordionNesting = () =>
  <Accordion>
    <AccordionItem icon={randomIcon()} title={faker.lorem.sentence()}>
      <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    </AccordionItem>
    <AccordionItem icon={randomIcon()} title={faker.lorem.sentence()} isOpened>
      <Accordion>
        <AccordionItem title={faker.lorem.sentence()}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </AccordionItem>
        <AccordionItem title={faker.lorem.sentence()}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </AccordionItem>
        <AccordionItem title={faker.lorem.sentence()}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </AccordionItem>
        <AccordionItem title={faker.lorem.sentence()}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </AccordionItem>
      </Accordion>
    </AccordionItem>
    <AccordionItem icon={randomIcon()} title={faker.lorem.sentence()}>
      <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    </AccordionItem>
    <AccordionItem icon={randomIcon()} title={faker.lorem.sentence()}>
      <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    </AccordionItem>
  </Accordion>
