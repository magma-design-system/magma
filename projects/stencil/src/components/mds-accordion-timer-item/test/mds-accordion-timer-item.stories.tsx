import { typographyPrimaryDictionary } from '@dictionary/typography'
import { h } from '@stencil/core'
import { lokiDisabled } from '@test/loki-disabled'

export default {
  title: 'UI / Accordion Timer / Accordion Timer Item',
  argTypes: {
    description: {
      type: { name: 'string' },
      description: 'Specifies the title shown when the accordion is closed or opened',
    },
    active: {
      type: { name: 'boolean' },
      description: 'Specifies if the accordion item is opened or not',
    },
    progress: {
      control: { type: 'range', step: 0.01, min: 0, max: 1 },
      type: { name: 'number' },
      description: 'A value between 0 and 100 that rapresents the status progress',
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
  <div>
    <mds-accordion-timer-item {...args}>
      <mds-text>Blipbug presenta delle fattezze riconducibili agli insetti nello stadio pre-crisalide. Il suo corpo si sviluppa in lunghezza, ed è formato principalmente da tre parti: la sua grande testa, il suo collo (molto simile ad un collare), e il corpo vero e proprio. La prima di queste è suddivisa in una parte color crema e una parte color denim; dello stesso colore sono le appenidici a forma di "V" che si trovano sopra e ai lati della testa. I suoi occhi sono enormi e grigi, ed hanno delle sottilissime sopracciglia sopra di essi. Il suo "collare", anch'esso color denim, presenta delle "setole" giallo sabbia, con le quali percepisce i segnali esterni: stesso colore si presenta nel segmento centrale della sua parte inferiore, dove sono presenti un primo paio di zampe crema. Il segmento superiore del corpo è bianco e ospita delle zampe anteriori color crema, ed infine, la parte finale, o la "coda", è color denim e finisce con un'appendice a "V" un po' piú grossa.</mds-text>
    </mds-accordion-timer-item>
  </div>

export const Default = Template.bind({})
Default.args = {
  description: 'Blipbug',
}

export const Active = Template.bind({})
Active.args = {
  active: true,
  description: 'Blipbug',
}

export const Progress = Template.bind({})
Progress.args = {
  active: true,
  description: 'Blipbug',
  progress: 0.5,
}

Default.story = lokiDisabled
Active.story = lokiDisabled
Progress.story = lokiDisabled
