import { h } from '@stencil/core'
import { useState, useEffect } from 'react'
import {
  modalPositionDictionary,
  modalOverflowDictionary,
  modalAnimationStyleDictionary,
  modalInteractionDictionary,
} from '../meta/dictionary'

export default {
  title: 'UI / Modal',
  argTypes: {
    animation: {
      control: { type: 'select' },
      description: 'Specifies the animation style of the window',
      options: modalAnimationStyleDictionary,
      type: { name: 'string' },
    },
    backdrop: {
      description: 'Specifies if the modal shows the backdrop',
      type: { name: 'boolean' },
    },
    interaction: {
      control: { type: 'select' },
      description: 'Specifies the animation style of the window',
      options: modalInteractionDictionary,
      type: { name: 'string' },
    },
    opened: {
      description: 'Specifies if the modal is opened or not',
      type: { name: 'boolean' },
    },
    overflow: {
      description:
        'Specifies if the component prevents the body from scrolling when modal window is opened',
      control: { type: 'select' },
      options: modalOverflowDictionary,
      type: { name: 'string' },
    },
    position: {
      control: { type: 'select' },
      description: 'Specifies the animation position of the modal window',
      options: modalPositionDictionary,
      type: { name: 'string' },
    },
  },
}

const firstName = 'Mario'
const lastName = 'Rossi'
const fullName = `${firstName} ${lastName}`
const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@nintendo.com`

const Template = args => {
  const [opened, setOpened] = useState(false)
  useEffect(() => {
    const actionElement = document.querySelector('#action')
    const modalElement = document.querySelector('#modal')

    if (actionElement === null || modalElement === null) {
      // eslint-disable-next-line no-alert
      alert('Element/s not found')
      return
    }

    modalElement.addEventListener('mdsModalClose', () => {
      console.info('mdsModalClose')
      setOpened(false)
    })
    modalElement.addEventListener('mdsModalHide', () => {
      console.info('mdsModalHide')
      setOpened(false)
    })
  }, [])

  if (args.opened !== null) {
    args.opened = null
  }

  return (
    <div>
      <mds-button id="action" onClick={() => setOpened(true)}>
        Open modal
      </mds-button>
      <mds-modal
        id="modal"
        {...args}
        opened={opened === true ? true : undefined}
      >
        <header
          slot="top"
          class="p-800 flex gap-400 items-center border-b border-solid border-0 border-tone-neutral-09 dark:border-tone-neutral-08"
        >
          <div class="dark:bg-tone-neutral-01 dark:p-200 bg-transparent w-1600 h-1600">
            <mds-img class="w-full" src="./logo-gruppo-maggioli-512w.webp" />
          </div>
          <div class="text-tone-neutral-02">
            <mds-text typography="h5" class="truncate min-w-0">
              Maggioli Editore
            </mds-text>
            <mds-text typography="detail" class="truncate min-w-0">
              Menu di servizio
            </mds-text>
          </div>
        </header>
        <div class="p-800">
          <mds-text>
            As a multi-brand design syastem, our components need to be flexible
            enough for any one of our brands to use them for multiple use cases.
            To achieve this, we ensure that all of the brands are involved in
            the specification stage, giving us more confidence that we’re
            future-proofing our components as more brands adopt NewsKit.
          </mds-text>
        </div>
        <footer
          slot="bottom"
          class="p-800 flex gap-400 text-tone-neutral-02 border-t border-solid border-0 border-tone-neutral-09 dark:border-tone-neutral-08"
        >
          <mds-author class="flex-grow">
            <mds-avatar
              slot="avatar"
              class="w-1600 max-mobile:w-1200"
              src="./avatar-01-200x200.jpeg"
            />
            <mds-text typography="h6">{fullName}</mds-text>
            <mds-text typography="caption" class="text-tone-neutral-04">
              {email}
            </mds-text>
          </mds-author>
          <mds-button icon="mdi/dots-vertical" variant="light"></mds-button>
        </footer>
      </mds-modal>
    </div>
  )
}

const TemplateStyle = args => {
  const [opened, setOpened] = useState(false)
  useEffect(() => {
    const actionElement = document.querySelector('#action')
    const modalElement = document.querySelector('#modal')

    if (actionElement === null || modalElement === null) {
      // eslint-disable-next-line no-alert
      alert('Element/s not found')
      return
    }

    modalElement.addEventListener('mdsModalClose', () => {
      console.info('mdsModalClose')
      setOpened(false)
    })
    modalElement.addEventListener('mdsModalHide', () => {
      console.info('mdsModalHide')
      setOpened(false)
    })
  }, [])

  if (args.opened !== null) {
    args.opened = null
  }

  return (
    <div>
      <mds-button id="action" onClick={() => setOpened(true)}>
        Open modal
      </mds-button>
      <mds-modal
        id="modal"
        {...args}
        style={{
          '--mds-modal-window-overflow': 'hidden',
          '--mds-modal-window-distance': '1rem',
          '--mds-modal-window-radius': '1rem',
        }}
        opened={opened === true ? true : undefined}
      >
        <header
          slot="top"
          class="p-800 flex gap-400 items-center border-b border-solid border-0 border-tone-neutral-09"
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
        <div class="p-800">
          <mds-text>
            As a multi-brand design syastem, our components need to be flexible
            enough for any one of our brands to use them for multiple use cases.
            To achieve this, we ensure that all of the brands are involved in
            the specification stage, giving us more confidence that we’re
            future-proofing our components as more brands adopt NewsKit.
          </mds-text>
        </div>
        <footer
          slot="bottom"
          class="p-800 flex gap-400 text-tone-neutral-02 border-t border-solid border-0 border-tone-neutral-09"
        >
          <mds-author class="flex-grow">
            <mds-avatar
              slot="avatar"
              class="w-1600 max-mobile:w-1200"
              src="./avatar-01-200x200.jpeg"
            />
            <mds-text typography="h6">{fullName}</mds-text>
            <mds-text typography="caption" class="text-tone-neutral-04">
              {email}
            </mds-text>
          </mds-author>
          <mds-button icon="mdi/dots-vertical" variant="light"></mds-button>
        </footer>
      </mds-modal>
    </div>
  )
}

const TemplateOverflow = args => {
  const [opened, setOpened] = useState(false)
  useEffect(() => {
    const actionElement = document.querySelector('#action')
    const modalElement = document.querySelector('#modal')

    if (actionElement === null || modalElement === null) {
      // eslint-disable-next-line no-alert
      alert('Element/s not found')
      return
    }

    modalElement.addEventListener('mdsModalClose', () => {
      console.info('mdsModalClose')
      setOpened(false)
    })
    modalElement.addEventListener('mdsModalHide', () => {
      console.info('mdsModalHide')
      setOpened(false)
    })
  }, [])

  if (args.opened !== null) {
    args.opened = null
  }

  return (
    <div class="relative">
      <div class="grid">
        {Array(40)
          .fill(null)
          .map((_value, index) => (
            <div
              key={index}
              class="h-[100px] flex items-start justify-center text-center border-0 border-t border-solid border-t-tone-neutral-07"
            >
              <mds-text
                class="px-200 py-100 rounded-b-lg bg-tone-neutral-10 border-t-0 border border-solid border-tone-neutral-07"
                typography="snippet"
                tag="div"
              >
                {index === 0 ? '0px' : index + '00px'}
              </mds-text>
            </div>
          ))}
      </div>
      <mds-button
        class="fixed top-600 left-600"
        id="action"
        onClick={() => setOpened(true)}
      >
        Open modal
      </mds-button>
      <mds-modal
        id="modal"
        {...args}
        opened={opened === true ? true : undefined}
      >
        <header
          slot="top"
          class="p-800 flex gap-400 items-center border-b border-solid border-0 border-tone-neutral-09"
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
        <div class="p-800">
          <mds-text>
            As a multi-brand design syastem, our components need to be flexible
            enough for any one of our brands to use them for multiple use cases.
            To achieve this, we ensure that all of the brands are involved in
            the specification stage, giving us more confidence that we’re
            future-proofing our components as more brands adopt NewsKit.
          </mds-text>
        </div>
        <footer
          slot="bottom"
          class="p-800 flex gap-400 text-tone-neutral-02 border-t border-solid border-0 border-tone-neutral-09"
        >
          <mds-author class="flex-grow">
            <mds-avatar
              slot="avatar"
              class="w-1600 max-mobile:w-1200"
              src="./avatar-01-200x200.jpeg"
            />
            <mds-text typography="h6">{fullName}</mds-text>
            <mds-text typography="caption" class="text-tone-neutral-04">
              {email}
            </mds-text>
          </mds-author>
          <mds-button icon="mdi/dots-vertical" variant="light"></mds-button>
        </footer>
      </mds-modal>
    </div>
  )
}

const CustomTemplate = args => {
  const [opened, setOpened] = useState(false)
  useEffect(() => {
    const actionElement = document.querySelector('#action')
    const modalElement = document.querySelector('#modal')
    const windowElement = document.querySelector('#window')

    if (
      actionElement === null ||
      modalElement === null ||
      windowElement === null
    ) {
      // eslint-disable-next-line no-alert
      alert('Element/s not found')
      return
    }

    windowElement.addEventListener('mdsBannerClose', () => {
      console.info('mdsBannerClose')
      setOpened(false)
    })

    modalElement.addEventListener('mdsModalClose', () => {
      console.info('mdsModalClose')
      setOpened(false)
    })
    modalElement.addEventListener('mdsModalHide', () => {
      console.info('mdsModalHide')
      setOpened(false)
    })
  }, [])

  if (args.opened !== null) {
    args.opened = null
  }

  return (
    <div>
      <mds-button id="action" onClick={() => setOpened(true)}>
        Open modal
      </mds-button>
      <mds-modal
        id="modal"
        {...args}
        opened={opened === true ? true : undefined}
      >
        <mds-banner
          id="window"
          slot="window"
          class="max-w-[400px] w-full mx-6"
          deletable
          headline="Action required"
        >
          <mds-text typography="detail">
            As a multi-brand design system, our components need to be flexible
            enough for any one of our brands to use them for multiple use cases.
            To achieve this, we ensure that all of the brands are involved in
            the specification stage, giving us more confidence that we’re
            future-proofing our components as more brands adopt NewsKit.
          </mds-text>
          <mds-button slot="actions" variant="primary" tone="quiet">
            Cancel
          </mds-button>
          <mds-button slot="actions" variant="primary">
            Confirm
          </mds-button>
        </mds-banner>
      </mds-modal>
    </div>
  )
}

const NestedModalTemplate = () => {
  const [openedFirstModal, setFirstModalOpened] = useState(false)
  const [openedSecondModal, setSecondModalOpened] = useState(false)

  useEffect(() => {
    const firstModalElement = document.querySelector('#modal-01')
    const secondModalElement = document.querySelector('#modal-02')

    if (firstModalElement === null || secondModalElement === null) {
      // eslint-disable-next-line no-alert
      alert('Element/s not found')
      return
    }

    firstModalElement.addEventListener('mdsModalClose', () => {
      setFirstModalOpened(false)
    })
    secondModalElement.addEventListener('mdsModalClose', () => {
      setSecondModalOpened(false)
    })
  }, [])

  return (
    <div>
      <mds-button onClick={() => setFirstModalOpened(true)}>
        Open first modal
      </mds-button>
      <mds-modal
        id="modal-01"
        position="right"
        opened={openedFirstModal === true ? true : undefined}
        onMdsModalClose={() => setFirstModalOpened(false)}
        style={{ '--mds-modal-window-max-width': '66%' }}
      >
        <div class="p-600">
          <mds-button
            class="self-start justify-self-start"
            onClick={() => setSecondModalOpened(true)}
          >
            Open nested modal
          </mds-button>
        </div>
      </mds-modal>
      <mds-modal
        id="modal-02"
        position="right"
        opened={openedSecondModal === true ? true : undefined}
        onMdsModalClose={() => setSecondModalOpened(false)}
        style={{ '--mds-modal-window-max-width': '33%' }}
      >
        <div class="p-600">
          <mds-text>This is the nested modal</mds-text>
        </div>
      </mds-modal>
    </div>
  )
}

export const Default = {
  render: Template,

  args: {
    position: 'right',
    opened: true,
  },
}

export const Backdrop = {
  render: Template,

  args: {
    position: 'right',
    opened: true,
    backdrop: undefined,
  },
}

export const BodyOverflowDisabled = {
  render: TemplateOverflow,

  args: {
    overflow: 'auto',
    opened: true,
    position: 'right',
  },
}

export const DefaultWindowCustomized = {
  render: TemplateStyle,

  args: {
    position: 'right',
    animation: 'slide',
    opened: true,
  },
}

export const CustomWindowAnimation = {
  render: CustomTemplate,
  args: {
    animation: 'custom',
  },
}

export const CustomWindowElement = {
  render: CustomTemplate,

  args: {
    opened: true,
  },
}

export const ARIATest = {
  render: CustomTemplate,

  args: {
    opened: true,
  },
}

export const UseCaseNestedModal = {
  render: NestedModalTemplate,
}
