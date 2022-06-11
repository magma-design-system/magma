import {
  floatingUIPlacementDictionary,
  floatingUIStrategyDictionary,
} from '@dictionary/floating-ui'
import { h } from '@stencil/core'
import { typographyTooltipDictionary } from '@dictionary/typography'

export default {
  title: 'UI / Tooltip',
  argTypes: {
    arrow: {
      type: { name: 'boolean' },
      description: 'If set, the component will have an arrow pointing to the caller',
    },
    'arrow-padding': {
      type: { name: 'number' },
      description: 'Sets the distance between the arrow and tooltip margins',
    },
    'auto-placement': {
      type: { name: 'boolean' },
      description: 'If set, the component will be placed automatically near it’s caller',
    },
    flip: {
      type: { name: 'boolean' },
      description: 'Specifies the placement of the component if no space is available where it is placed',
    },
    offset: {
      type: { name: 'number' },
      description: 'Sets distance between the tooltip and the caller',
    },
    placement: {
      type: { name: 'string' },
      description: 'Specifies where the component should be placed relative to the caller',
      options: floatingUIPlacementDictionary,
      control: { type: 'select' },
    },
    typography: {
      description: 'Specifies the font typography of the element',
      options: typographyTooltipDictionary,
      control: { type: 'select' },
    },
    shift: {
      type: { name: 'boolean' },
      description: 'If set, the component will be kept inside the viewport',
    },
    'shift-padding': {
      type: { name: 'number' },
      description: 'Sets a safe area distance between the tooltip and the body',
    },
    smooth: {
      type: { name: 'boolean' },
      description: 'If set, the component will follow the caller smoothly, visible when the page scrolls',
    },
    strategy: {
      type: { name: 'string' },
      description: 'Sets the CSS position strategy of the component',
      options: floatingUIStrategyDictionary,
      control: { type: 'select' },
    },
    visible: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is visible',
    },
  },
}

const Template = ({ layout, ...args }) =>
  <div class={layout}>
    <mds-button id="my-tooltip">Show Fred</mds-button>
    <mds-tooltip target="my-tooltip" {...args}>
      This is a tooltip comment.
    </mds-tooltip>
  </div>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const NoTarget = () =>
  <div>
    <mds-button id="tooltip-trigger">Trigger</mds-button>
    {/* Intended the error here */}
    <mds-tooltip>
      Follow mouse?
    </mds-tooltip>
  </div>

export const Default = Template.bind({})
Default.args = {
  class: 'max-w-[350px] w-full',
  layout: 'flex justify-center',
}

export const Arrow = Template.bind({})
Arrow.args = {
  class: 'max-w-[350px] w-full',
  arrow: true,
  backdrop: true,
  'shift-padding': 32,
  layout: 'flex justify-start',
  visible: true,
}

export const ArrowPadding = Template.bind({})
ArrowPadding.args = {
  class: 'max-w-[350px] w-full',
  arrow: true,
  backdrop: true,
  'arrow-padding': 50,
  'shift-padding': 32,
  layout: 'flex justify-start',
  visible: true,
}

export const AutoPlacement = Template.bind({})
AutoPlacement.args = {
  class: 'max-w-[350px] w-full',
  'auto-placement': true,
  layout: 'flex justify-end',
  visible: true,
}

export const Backdrop = Template.bind({})
Backdrop.args = {
  class: 'max-w-[350px] w-full',
  backdrop: true,
  layout: 'flex justify-center',
  visible: false,
}

export const Flip = Template.bind({})
Flip.args = {
  class: 'max-w-[350px] w-full',
  layout: 'flex h-[200vh] justify-center items-center',
  flip: true,
  visible: true,
}

export const Offset = Template.bind({})
Offset.args = {
  class: 'max-w-[350px] w-full',
  layout: 'flex justify-center items-center',
  offset: 50,
  backdrop: true,
  visible: true,
}

export const Placement = Template.bind({})
Placement.args = {
  class: 'max-w-[350px] w-full',
  layout: 'flex justify-center items-center',
  placement: 'right-start',
  backdrop: true,
  visible: true,
}

export const Shift = Template.bind({})
Shift.args = {
  class: 'max-w-[350px] w-full',
  layout: 'flex justify-end',
  shift: true,
  visible: true,
}

export const ShiftPadding = Template.bind({})
ShiftPadding.args = {
  class: 'max-w-[350px] w-full',
  layout: 'flex justify-end',
  shift: true,
  'shift-padding': 50,
  visible: true,
}

export const Smooth = Template.bind({})
Smooth.args = {
  class: 'max-w-[350px] w-full',
  layout: 'flex justify-start h-[100vh] mt-[25vh]',
  smooth: true,
  visible: true,
}

export const Strategy = Template.bind({})
Strategy.args = {
  class: 'max-w-[350px] w-full',
  layout: 'flex justify-start',
  strategy: 'absolute',
  visible: true,
}

export const Visible = Template.bind({})
Visible.args = {
  class: 'max-w-[350px] w-full',
  layout: 'flex justify-start',
  visible: false,
}
