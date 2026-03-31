import {
  floatingUIPlacementDictionary,
  floatingUIStrategyDictionary,
} from '@type/floating-ui'
import { dropdownInteractionDictionary } from '../meta/dictionary'
import { h } from '@stencil/core'
import { useState, useEffect } from 'react'

export default {
  title: 'UI / Dropdown',
  argTypes: {
    arrow: {
      type: { name: 'boolean' },
      description:
        'If set, the component will have an arrow pointing to the caller',
    },
    'arrow-padding': {
      type: { name: 'number' },
      description: 'Sets the distance between the arrow and dropdown margins',
    },
    'auto-placement': {
      type: { name: 'boolean' },
      description:
        'If set, the component will be placed automatically near it’s caller',
    },
    backdrop: {
      type: { name: 'boolean' },
      description: 'Specifies if the component has a backdrop background',
    },
    flip: {
      type: { name: 'boolean' },
      description:
        'Specifies the placement of the component if no space is available where it is placed',
    },
    interaction: {
      type: { name: 'string' },
      description:
        'Specifies if the component is triggered from the caller on mouseover or click event',
      options: dropdownInteractionDictionary,
      control: { type: 'select' },
    },
    offset: {
      type: { name: 'number' },
      description: 'Sets distance between the dropdown and the caller',
    },
    placement: {
      type: { name: 'string' },
      description:
        'Specifies where the component should be placed relative to the caller',
      options: floatingUIPlacementDictionary,
      control: { type: 'select' },
    },
    shift: {
      type: { name: 'boolean' },
      description: 'If set, the component will be kept inside the viewport',
    },
    'shift-padding': {
      type: { name: 'number' },
      description:
        'Sets a safe area distance between the dropdown and the body',
    },
    smooth: {
      type: { name: 'boolean' },
      description:
        'If set, the component will follow the caller smoothly, visible when the page scrolls',
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

const Template = ({ layout, ...args }) => (
  <div class={layout}>
    <mds-button id="my-dropdown">Show Fred</mds-button>
    <mds-dropdown target="#my-dropdown" {...args}>
      <mds-author class="text-tone-neutral-04">
        <mds-avatar
          aria-describedby="A protrait of Frederick Phillips Brooks Jr."
          initials="fb"
          src="./fred-brooks-zoom.webp"
          slot="avatar"
          class="w-2000 bg-brand-maggioli-06"
        />
        <mds-text typography="h6" class="text-tone-neutral-02">
          Fred Brooks
        </mds-text>
        <mds-text typography="caption">Software engineer</mds-text>
        <mds-text typography="caption">IT</mds-text>
      </mds-author>
      <mds-text typography="detail" class="text-tone-neutral-04">
        Frederick Phillips "Fred" Brooks Jr. (born April 19, 1931) is an
        American computer architect, software engineer, and computer scientist.
      </mds-text>
      <mds-hr class="h-[2px] bg-tone-neutral-08" />
      <mds-button
        class="justify-start px-0"
        icon="mi/baseline/info"
        variant="dark"
        tone="text"
      >
        User infos
      </mds-button>
      <mds-button
        class="justify-start px-0"
        icon="mi/baseline/settings"
        variant="dark"
        tone="text"
      >
        Account
      </mds-button>
      <mds-button
        class="justify-start px-0"
        icon="mi/baseline/logout"
        variant="dark"
        tone="text"
      >
        Exit
      </mds-button>
    </mds-dropdown>
  </div>
)

const TemplatePlacement = ({ ...args }) => (
  <div class="min-h-dvh flex items-center justify-center">
    <mds-button id="my-dropdown">Show Fred</mds-button>
    <mds-dropdown target="#my-dropdown" {...args}>
      <mds-author class="text-tone-neutral-04">
        <mds-avatar
          aria-describedby="A protrait of Frederick Phillips Brooks Jr."
          initials="fb"
          src="./fred-brooks-zoom.webp"
          slot="avatar"
          class="w-2000 bg-brand-maggioli-06"
        />
        <mds-text typography="h6" class="text-tone-neutral-02">
          Fred Brooks
        </mds-text>
        <mds-text typography="caption">Software engineer</mds-text>
        <mds-text typography="caption">IT</mds-text>
      </mds-author>
      <mds-text typography="detail" class="text-tone-neutral-04">
        Frederick Phillips "Fred" Brooks Jr. (born April 19, 1931) is an
        American computer architect, software engineer, and computer scientist.
      </mds-text>
      <mds-hr class="h-[2px] bg-tone-neutral-08" />
      <mds-button
        class="justify-start px-0"
        icon="mi/baseline/info"
        variant="dark"
        tone="text"
      >
        User infos
      </mds-button>
      <mds-button
        class="justify-start px-0"
        icon="mi/baseline/settings"
        variant="dark"
        tone="text"
      >
        Account
      </mds-button>
      <mds-button
        class="justify-start px-0"
        icon="mi/baseline/logout"
        variant="dark"
        tone="text"
      >
        Exit
      </mds-button>
    </mds-dropdown>
  </div>
)

export const NoTarget = () => (
  <div>
    <mds-button id="dropdown-trigger">Trigger</mds-button>
    {/* Intended the error here */}
    <mds-dropdown target="">
      <mds-text>Ciao</mds-text>
    </mds-dropdown>
  </div>
)

const TemplateNested = ({ ...args }) => (
  <div class="min-h-[200vh]">
    <mds-header>
      <mds-header-bar>
        <div class="flex gap-2 items-center">
          <mds-img class="w-1000" src="./logo-gruppo-maggioli.svg" />
          <div class="mb-1">
            <mds-text typography="h6">Gruppo Maggioli</mds-text>
            <mds-text class="text-tone-neutral-04" typography="option">
              Header by RD Team
            </mds-text>
          </div>
        </div>
        <mds-button slot="nav" id="my-dropdown">
          Show Fred
        </mds-button>
      </mds-header-bar>
    </mds-header>
    <mds-dropdown target="#my-dropdown" class="max-w-[350px]" {...args}>
      <mds-author class="text-tone-neutral-04">
        <mds-avatar
          aria-describedby="A protrait of Frederick Phillips Brooks Jr."
          initials="fb"
          src="./fred-brooks-zoom.webp"
          slot="avatar"
          class="w-20 bg-brand-maggioli-06"
        />
        <mds-text typography="h6" class="text-tone-neutral-02">
          Fred Brooks
        </mds-text>
        <mds-text typography="caption">Software engineer</mds-text>
        <mds-text typography="caption">IT</mds-text>
      </mds-author>
      <mds-text typography="detail" class="text-tone-neutral-04">
        Frederick Phillips "Fred" Brooks Jr. (born April 19, 1931) is an
        American computer architect, software engineer, and computer scientist.
      </mds-text>
      <mds-hr class="h-[2px] bg-tone-neutral-08" />
      <mds-button
        class="justify-start px-0"
        icon="mi/baseline/info"
        variant="dark"
        tone="text"
      >
        User infos
      </mds-button>
      <mds-button
        class="justify-start px-0"
        icon="mi/baseline/settings"
        variant="dark"
        tone="text"
      >
        Account
      </mds-button>
      <mds-button
        class="justify-start px-0"
        icon="mi/baseline/logout"
        variant="dark"
        tone="text"
      >
        Exit
      </mds-button>
    </mds-dropdown>
  </div>
)

const TemplatePerformance = ({ ...args }) => (
  <div class="grid">
    {Array(400)
      .fill(null)
      .map((_value, index) => (
        <div
          key={index}
          class="h-[100px] flex items-start justify-center text-center border-0 border-t border-solid border-t-tone-neutral-07"
        >
          <p
            id={'button-' + index}
            class="px-200 py-100 rounded-b-lg bg-tone-neutral-10 border-t-0 border border-solid border-tone-neutral-07"
          >
            Pseudo-button {index}
          </p>
          <mds-dropdown target={'#button-' + index} {...args}>
            <p> Testo del dropdown per il bottone {index}</p>
          </mds-dropdown>
        </div>
      ))}
  </div>
)

const TemplateModalNested = () => {
  const [isModalOpened, setModalOpen] = useState(true)

  useEffect(() => {
    document.querySelector('mds-modal')?.addEventListener('mdsModalClose', () => {
      setModalOpen(false)
    })
  })

  return (
    <div class="grid">
      <div>
        <mds-button id="open-modal" onClick={() => setModalOpen(true)}>
          Open modal
        </mds-button>
      </div>
      <mds-modal
        position="right"
        opened={isModalOpened}
      >
        <header
          slot="top"
          class="p-800 flex gap-400 items-center border-b border-solid border-0 border-tone-neutral-09 max-w-[400px]"
        >
          <mds-img class="w-1600" src="./logo-gruppo-maggioli-512w.webp" />
          <div class="text-tone-neutral-02">
            <mds-text typography="h5" class="truncate min-w-0">
              Maggioli Editore
            </mds-text>
            <mds-text typography="detail" class="truncate min-w-0">
              Menu di servizio
            </mds-text>
          </div>
        </header>
        <div class="p-800 max-w-[400px] flex flex-col gap-400">
          <mds-button variant="primary" id="open-dropdown">
            Show dropdown
          </mds-button>
          <mds-dropdown
            target="#open-dropdown"
            backdrop={false}
            strategy="fixed"
          >
            <mds-button variant="light" class="justify-start">
              Dropdown action
            </mds-button>
            <mds-button variant="light" class="justify-start">
              Dropdown action
            </mds-button>
            <mds-button variant="light" class="justify-start">
              Dropdown action
            </mds-button>
          </mds-dropdown>
          <mds-button variant="light" class="justify-start">
            Other action
          </mds-button>
          <mds-button variant="light" class="justify-start">
            Other action
          </mds-button>
          <mds-button variant="light" class="justify-start">
            Other action
          </mds-button>
        </div>
      </mds-modal>
    </div>
  )
}

const TemplateStrategy = ({ ...args }) => (
  <div class="min-h-[200vh]">
    <mds-header>
      <mds-header-bar>
        <div class="flex gap-2 items-center">
          <mds-img class="w-1000" src="./logo-gruppo-maggioli.svg" />
          <div class="mb-1">
            <mds-text typography="h6">Gruppo Maggioli</mds-text>
            <mds-text class="text-tone-neutral-04" typography="option">
              Header by RD Team
            </mds-text>
          </div>
        </div>
        <mds-button slot="nav" id="my-dropdown">
          Strategy fixed
        </mds-button>
        <mds-dropdown
          target="#my-dropdown"
          class="max-w-[350px]"
          {...args}
          strategy="fixed"
        >
          <mds-author class="text-tone-neutral-04">
            <mds-avatar
              aria-describedby="A protrait of Frederick Phillips Brooks Jr."
              initials="fb"
              src="./fred-brooks-zoom.webp"
              slot="avatar"
              class="w-20 bg-brand-maggioli-06"
            />
            <mds-text typography="h6" class="text-tone-neutral-02">
              Fred Brooks
            </mds-text>
            <mds-text typography="caption">Software engineer</mds-text>
            <mds-text typography="caption">IT</mds-text>
          </mds-author>
          <mds-text typography="detail" class="text-tone-neutral-04">
            Frederick Phillips "Fred" Brooks Jr. (born April 19, 1931) is an
            American computer architect, software engineer, and computer
            scientist.
          </mds-text>
          <mds-hr class="h-[2px] bg-tone-neutral-08" />
          <mds-button
            class="justify-start px-0"
            icon="mi/baseline/info"
            variant="dark"
            tone="text"
          >
            User infos
          </mds-button>
          <mds-button
            class="justify-start px-0"
            icon="mi/baseline/settings"
            variant="dark"
            tone="text"
          >
            Account
          </mds-button>
          <mds-button
            class="justify-start px-0"
            icon="mi/baseline/logout"
            variant="dark"
            tone="text"
          >
            Exit
          </mds-button>
        </mds-dropdown>
      </mds-header-bar>
    </mds-header>

    <div class="flex justify-end flex-col min-h-3200">
      <mds-button id="dropdown-absolute">Strategy absolute</mds-button>
      <mds-dropdown
        target="#dropdown-absolute"
        class="max-w-[350px]"
        {...args}
        strategy="absolute"
        z-index={10}
        shift
        shiftPadding={50}
      >
        <mds-author class="text-tone-neutral-04">
          <mds-avatar
            aria-describedby="A protrait of Frederick Phillips Brooks Jr."
            initials="fb"
            src="./fred-brooks-zoom.webp"
            slot="avatar"
            class="w-20 bg-brand-maggioli-06"
          />
          <mds-text typography="h6" class="text-tone-neutral-02">
            Fred Brooks
          </mds-text>
          <mds-text typography="caption">Software engineer</mds-text>
          <mds-text typography="caption">IT</mds-text>
        </mds-author>
        <mds-text typography="detail" class="text-tone-neutral-04">
          Frederick Phillips "Fred" Brooks Jr. (born April 19, 1931) is an
          American computer architect, software engineer, and computer
          scientist.
        </mds-text>
        <mds-hr class="h-[2px] bg-tone-neutral-08" />
        <mds-button
          class="justify-start px-0"
          icon="mi/baseline/info"
          variant="dark"
          tone="text"
        >
          User infos
        </mds-button>
        <mds-button
          class="justify-start px-0"
          icon="mi/baseline/settings"
          variant="dark"
          tone="text"
        >
          Account
        </mds-button>
        <mds-button
          class="justify-start px-0"
          icon="mi/baseline/logout"
          variant="dark"
          tone="text"
        >
          Exit
        </mds-button>
      </mds-dropdown>
    </div>
  </div>
)

const TemplateTarget = args => {
  return (
    <div class="grid gap-400 p-600 rounded-xl bg-tone-neutral-09">
      <mds-entity icon="mi/baseline/info" id="opendropdown">
        <mds-text>click to open dropdown</mds-text>
        <mds-button
          slot="action"
          icon="mi/baseline/warning"
          variant="warning"
          tone="weak"
          onClick={() => console.info('')}
        ></mds-button>
      </mds-entity>
      <mds-dropdown target="#opendropdown" {...args}>
        Dropdown
      </mds-dropdown>
      <mds-text typography="paragraph">
        Do not use other click actions inside a element designed as dropdown
        target because its never been executed
      </mds-text>
    </div>
  )
}

export const Default = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    layout: 'flex justify-center',
  },
}

export const Arrow = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    arrow: true,
    backdrop: true,
    'shift-padding': 32,
    layout: 'flex justify-start',
    visible: false,
  },
}

export const ArrowPadding = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    arrow: true,
    backdrop: true,
    'arrow-padding': 50,
    'shift-padding': 32,
    layout: 'flex justify-start',
    visible: false,
  },
}

export const AutoPlacement = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    'auto-placement': true,
    layout: 'flex justify-end',
    visible: false,
  },
}

export const Backdrop = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    backdrop: true,
    layout: 'flex justify-center',
    visible: false,
  },
}

export const Flip = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    layout: 'flex h-[150vh] justify-center items-center',
    flip: true,
    visible: false,
  },
}

export const Interaction = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    backdrop: true,
    interaction: 'mouseover',
    layout: 'flex justify-center',
    visible: false,
  },
}

export const Offset = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    layout: 'flex justify-center items-center',
    offset: 50,
    backdrop: true,
    visible: false,
  },
}

export const Placement = {
  render: TemplatePlacement,

  args: {
    class: 'max-w-[350px] w-full',
    layout: 'flex justify-center items-center',
    placement: 'right-start',
    backdrop: true,
    visible: false,
  },
}

export const Shift = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    layout: 'flex justify-end',
    shift: true,
    visible: false,
  },
}

export const ShiftPadding = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    layout: 'flex justify-end',
    shift: true,
    'shift-padding': 50,
    visible: false,
  },
}

export const Smooth = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    layout: 'flex justify-start h-[100vh] mt-[25vh]',
    smooth: true,
    visible: false,
  },
}

export const Strategy = {
  render: TemplateStrategy,

  args: {
    class: 'max-w-[350px] w-full',
    layout: 'flex justify-start',
    visible: false,
  },
}

export const NestedBestPractice = {
  render: TemplateNested,

  args: {
    backdrop: true,
    strategy: 'fixed',
  },
}

export const Performance = TemplatePerformance.bind({
  backdrop: true,
})

export const ModalNested = {
  render: TemplateModalNested,
  args: {},
}

export const Target = {
  render: TemplateTarget,
  args: {},
}
