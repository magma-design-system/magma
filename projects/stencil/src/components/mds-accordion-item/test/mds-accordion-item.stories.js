import React from 'react'
import MdsAccordionItem from '@component/mds-accordion-item/mds-accordion-item'
import { typographyPrimaryDictionary } from '@dictionary/typography'

export default {
  title: 'UI / Accordion / Accordion Item',
  component: MdsAccordionItem,
  argTypes: {
    description: {
      type: { name: 'string' },
      description: 'Specifies the title shown when the accordion is closed or opened',
    },
    opened: {
      type: { name: 'boolean' },
      description: 'Specifies if the accordion item is opened or not',
    },
    typography: {
      type: { name: 'string' },
      description: 'Specifies the typography of the element',
      options: typographyPrimaryDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-accordion-item {...args}>
    <mds-text>Blipbug presenta delle fattezze riconducibili agli insetti nello stadio pre-crisalide. Il suo corpo si sviluppa in lunghezza, ed è formato principalmente da tre parti: la sua grande testa, il suo collo (molto simile ad un collare), e il corpo vero e proprio. La prima di queste è suddivisa in una parte color crema e una parte color denim; dello stesso colore sono le appenidici a forma di "V" che si trovano sopra e ai lati della testa. I suoi occhi sono enormi e grigi, ed hanno delle sottilissime sopracciglia sopra di essi. Il suo "collare", anch'esso color denim, presenta delle "setole" giallo sabbia, con le quali percepisce i segnali esterni: stesso colore si presenta nel segmento centrale della sua parte inferiore, dove sono presenti un primo paio di zampe crema. Il segmento superiore del corpo è bianco e ospita delle zampe anteriori color crema, ed infine, la parte finale, o la "coda", è color denim e finisce con un'appendice a "V" un po' piú grossa.</mds-text>
  </mds-accordion-item>

export const Default = Template.bind({})
Default.args = {
  description: 'Blipbug',
}

export const opened = Template.bind({})
opened.args = {
  opened: true,
  description: 'Blipbug',
}
