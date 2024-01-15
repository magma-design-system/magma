import {
  floatingUIPlacementDictionary,
  floatingUIStrategyDictionary,
} from '@dictionary/floating-ui'
import { h } from '@stencil/core'

export default {
  title: 'UI / Dropdown',
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
  <div class={layout}>
    <mds-button id="my-dropdown">Show Fred</mds-button>
    <mds-dropdown target="my-dropdown" {...args}>
      <mds-author class="text-tone-neutral-04">
        <mds-avatar aria-describedby="A protrait of Frederick Phillips Brooks Jr." initials="fb" src="./fred-brooks-zoom.webp" slot="avatar" class="w-2000 bg-brand-maggioli-06" />
        <mds-text typography="h6" class="text-tone-neutral-02">Fred Brooks</mds-text>
        <mds-text typography="caption">Software engineer</mds-text>
        <mds-text typography="caption">IT</mds-text>
      </mds-author>
      <mds-text typography="detail" class="text-tone-neutral-04">
        Frederick Phillips "Fred" Brooks Jr. (born April 19, 1931) is an American computer architect, software engineer, and computer scientist.
      </mds-text>
      <mds-hr class="h-[2px] bg-tone-neutral-08" />
      <mds-button class="justify-start px-0" icon="mi/baseline/info" variant="dark" tone="quiet">User infos</mds-button>
      <mds-button class="justify-start px-0" icon="mi/baseline/settings" variant="dark" tone="quiet">Account</mds-button>
      <mds-button class="justify-start px-0" icon="mi/baseline/logout" variant="dark" tone="quiet">Exit</mds-button>
    </mds-dropdown>
  </div>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const NoTarget = () =>
  <div>
    <mds-button id="dropdown-trigger">Trigger</mds-button>
    {/* Intended the error here */}
    <mds-dropdown target=''>
      <mds-text>Ciao</mds-text>
    </mds-dropdown>
  </div>

const TemplateNested = ({ ...args }) =>
  <div>
    <mds-header>
      <mds-header-bar>
        <div class="flex gap-2 items-center">
          <mds-img
            class="w-10"
            src="./logo-gruppo-maggioli.svg"
          />
          <div class="mb-1">
            <mds-text typography="h6">
              Gruppo Maggioli
            </mds-text>
            <mds-text
              class="text-tone-neutral-04"
              typography="option"
            >
              Header by RD Team
            </mds-text>
          </div>
        </div>
        <mds-button slot="nav" id="my-dropdown">Show Fred</mds-button>
      </mds-header-bar>
    </mds-header>
    <mds-dropdown target="my-dropdown" class="max-w-[350px]" {...args}>
      <mds-author class="text-tone-neutral-04">
        <mds-avatar aria-describedby="A protrait of Frederick Phillips Brooks Jr." initials="fb" src="./fred-brooks-zoom.webp" slot="avatar" class="w-20 bg-brand-maggioli-06" />
        <mds-text typography="h6" class="text-tone-neutral-02">Fred Brooks</mds-text>
        <mds-text typography="caption">Software engineer</mds-text>
        <mds-text typography="caption">IT</mds-text>
      </mds-author>
      <mds-text typography="detail" class="text-tone-neutral-04">
        Frederick Phillips "Fred" Brooks Jr. (born April 19, 1931) is an American computer architect, software engineer, and computer scientist.
      </mds-text>
      <mds-hr class="h-[2px] bg-tone-neutral-08" />
      <mds-button class="justify-start px-0" icon="mi/baseline/info" variant="dark" tone="quiet">User infos</mds-button>
      <mds-button class="justify-start px-0" icon="mi/baseline/settings" variant="dark" tone="quiet">Account</mds-button>
      <mds-button class="justify-start px-0" icon="mi/baseline/logout" variant="dark" tone="quiet">Exit</mds-button>
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
  layout: 'flex h-[150vh] justify-center items-center',
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

export const NestedBestPractice = TemplateNested.bind({})

NestedBestPractice.args = {
  backdrop: true,
}
