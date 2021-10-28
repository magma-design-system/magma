import React from 'react'
import MdsTooltip from '@component/mds-tooltip/mds-tooltip'
import { tooltipPositionDictionary } from '../meta/dictionary'
import faker from 'faker'

export default {
  title: 'UI / Tooltip',
  component: MdsTooltip,
  argTypes: {
    delay: {
      description: 'Specifies the delay when the tooltip will trigger',
      type: { name: 'number' },
    },
    for: {
      type: { name: 'string' },
      description: 'Specifies the id selector of the element will trigger the tooltip',
    },
    position: {
      type: { name: 'string' },
      description: 'Specifies the position of the tooltip relative to the trigger element',
      options: tooltipPositionDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <div className="flex items-center justify-center w-screen h-screen -mx-4 -my-4 bg-adjust-tone-18">
    <mds-button id={args.for}>Trigger on hover</mds-button>
    <mds-tooltip {...args}>
    { faker.lorem.sentence(3) }
    </mds-tooltip>
  </div>

const TemplateBig = args =>
  <div className="flex items-center justify-center w-screen h-screen -mx-4 -my-4 bg-adjust-tone-18">
    <mds-button id={args.for}>Trigger on hover</mds-button>
    <mds-tooltip {...args}>
      { faker.lorem.paragraph(5) }
    </mds-tooltip>
  </div>

export const Default = Template.bind({})
Default.args = {
  for: 'button-id',
}

export const delay = Template.bind({})
delay.args = {
  delay: 500,
  for: 'button-id',
}

export const position = TemplateBig.bind({})
position.args = {
  for: 'button-id',
  position: 'left',
}
