import React from 'react'
import MdsDropdown from '@component/mds-dropdown/mds-dropdown'
import clsx from 'clsx'
import {
  floatingUIPlacementDictionary,
  floatingUIStrategyDictionary,
} from '@dictionary/floating-ui'

export default {
  title: 'UI / Dropdown',
  component: MdsDropdown,
  argTypes: {
    arrow: {
      type: { name: 'boolean' },
      description: 'If set, the component will have an arrow pointing to the caller',
    },
    'arrow-padding': {
      type: { name: 'number' },
      description: 'Sets the distance between the arrow and dropdown margins',
    },
    'auto-placement': {
      type: { name: 'boolean' },
      description: 'If set, the component will be placed automatically near it’s caller',
    },
    backdrop: {
      type: { name: 'boolean' },
      description: 'Specifies if the component has a backdrop background',
    },
    flip: {
      type: { name: 'boolean' },
      description: 'Specifies the placement of the component if no space is available where it is placed',
    },
    offset: {
      type: { name: 'number' },
      description: 'Sets distance between the dropdown and the caller',
    },
    placement: {
      type: { name: 'string' },
      description: 'Specifies where the component should be placed relative to the caller',
      options: floatingUIPlacementDictionary,
      control: { type: 'select' },
    },
    shift: {
      type: { name: 'boolean' },
      description: 'If set, the component will be kept inside the viewport',
    },
    'shift-padding': {
      type: { name: 'number' },
      description: 'Sets a safe area distance between the dropdown and the body',
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
  <div className={clsx(layout)}>
    <mds-button for="my-dropdown">Show Fred</mds-button>
    <mds-dropdown id="my-dropdown" {...args}>
      <mds-author class="text-adjust-tone-04">
        <mds-avatar initials="fb" src="./fred-brooks-zoom.webp" slot="avatar" class="w-20 bg-brand-maggioli-06"/>
        <mds-text typography="h6" class="text-adjust-tone-02">Fred Brooks</mds-text>
        <mds-text typography="caption">Software engineer</mds-text>
        <mds-text typography="caption">IT</mds-text>
      </mds-author>
      <mds-text typography="detail" class="text-tone-neutral-04">
        Frederick Phillips "Fred" Brooks Jr. (born April 19, 1931) is an American computer architect, software engineer, and computer scientist.
      </mds-text>
      <mds-hr class="h-[2px] bg-tone-neutral-08"/>
      <mds-button class="justify-start" icon="mi/baseline/info" variant="dark" tone="quiet">User infos</mds-button>
      <mds-button class="justify-start" icon="mi/baseline/settings" variant="dark" tone="quiet">Account</mds-button>
      <mds-button class="justify-start" icon="mi/baseline/logout" variant="dark" tone="quiet">Exit</mds-button>
    </mds-dropdown>
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


export const Backdrop = Template.bind({})
Backdrop.args = {
  class: 'max-w-[350px] w-full',
  backdrop: true,
  layout: 'flex justify-center',
}

export const Shiftable = Template.bind({})
Shiftable.args = {
  class: 'max-w-[350px] w-full',
  layout: 'flex justify-end',
  shift: true,
}

export const autoPlacement = Template.bind({})
autoPlacement.args = {
  class: 'max-w-[350px] w-full',
  layout: 'flex justify-end',
  autoPlacement: true,
}

export const Flippable = Template.bind({})
Flippable.args = {
  class: 'max-w-[350px] w-full',
  layout: 'flex h-[200vh] justify-center items-center',
  flip: true,
}
