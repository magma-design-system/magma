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
    'auto-placement': {
      type: { name: 'boolean' },
      description: 'If set, the component will be placed automatically near it’s caller',
    },
    delay: {
      type: { name: 'number' },
      description: 'Sets the delay time when the tooltip is triggered',
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
    <mds-tooltip target="#my-tooltip" {...args}>
      This is a tooltip comment.
    </mds-tooltip>
  </div>

const TemplateCustomContents = ({ layout, ...args }) =>
  <div class={layout}>
    <mds-button id="my-tooltip">Show Fred</mds-button>
    <mds-tooltip target="#my-tooltip" {...args} style={{ '--mds-tooltip-delay': '0.25s' }}>
      <mds-author class="text-tone-neutral-04 p-2">
        <mds-avatar initials="fb" src="./fred-brooks-zoom.webp" slot="avatar" class="w-14 bg-brand-maggioli-06"/>
        <mds-text typography="h6" class="text-tone-neutral-02">Fred Brooks</mds-text>
        <mds-text typography="caption">Software engineer</mds-text>
        <mds-text typography="caption">IT</mds-text>
      </mds-author>
    </mds-tooltip>
  </div>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const NoTarget = () =>
  <div>
    <mds-button id="tooltip-trigger">Trigger</mds-button>
    {/* Intended the error here */}
    <mds-tooltip target="tooltip-trigger">
      Follow mouse?
    </mds-tooltip>
  </div>

export const Default = Template.bind({})
Default.args = {
  layout: 'flex justify-center',
}

export const CustomContents = TemplateCustomContents.bind({})
CustomContents.args = {
  layout: 'flex justify-center',
}

export const Arrow = Template.bind({})
Arrow.args = {
  arrow: true,
  'shift-padding': 32,
  layout: 'flex justify-start',
  visible: true,
}

export const AutoPlacement = Template.bind({})
AutoPlacement.args = {
  'auto-placement': true,
  layout: 'flex justify-end',
  visible: true,
}

export const Flip = Template.bind({})
Flip.args = {
  layout: 'flex h-[200vh] justify-center items-center',
  flip: true,
  visible: true,
}

export const Offset = Template.bind({})
Offset.args = {
  layout: 'flex justify-center items-center',
  offset: 50,
  visible: true,
}

export const Placement = Template.bind({})
Placement.args = {
  'auto-placement': false,
  layout: 'flex justify-center items-center',
  placement: 'right-start',
  visible: true,
}

export const Shift = Template.bind({})
Shift.args = {
  layout: 'flex justify-end',
  shift: true,
  visible: true,
}

export const ShiftPadding = Template.bind({})
ShiftPadding.args = {
  layout: 'flex justify-end',
  shift: true,
  'shift-padding': 50,
  visible: true,
}

export const Strategy = Template.bind({})
Strategy.args = {
  layout: 'flex justify-start',
  strategy: 'absolute',
  visible: true,
}

export const Visible = Template.bind({})
Visible.args = {
  layout: 'flex justify-start',
  visible: false,
}
