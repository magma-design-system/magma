import { loadingDictionary } from '@type/loading'
import { h } from '@stencil/core'
import { useEffect, useState } from 'react'
import {
  iconsDictionary,
  mggIconsDictionary,
  svgIconsDictionary,
} from '@type/icon'

const URLs = ['https://www.typeform.com/', 'http://azumbrunnen.me/']

const urlPage = `${location.origin}/iframe.html?id=common-tests--example-page&viewMode=story`

export default {
  title: 'UI / URL View',
  argTypes: {
    icon: {
      type: { name: 'string' },
      description:
        'The name of the icon or a base64 string to render it as an svg',
      options: mggIconsDictionary
        .concat(iconsDictionary)
        .concat(svgIconsDictionary),
      control: { type: 'select' },
    },
    domain: {
      description: 'Specifies if domain is visible on header',
      type: { name: 'boolean' },
    },
    loading: {
      control: { type: 'select' },
      description:
        'Specifies whether a browser should load an iframe immediately or to defer loading of images until some conditions are met.',
      options: loadingDictionary,
      type: { name: 'string' },
    },
    src: {
      control: { type: 'select' },
      description: 'Specifies the URL to the web page',
      options: URLs,
      type: { name: 'string', required: true },
    },
  },
}

const Template = args => {
  const [opened, setOpened] = useState(false)
  useEffect(() => {
    const actionElement = document.querySelector('#action')
    const modalElement = document.querySelector('#modal')
    const urlViewElement = document.querySelector('#url-view')

    if (
      actionElement === null ||
      modalElement === null ||
      urlViewElement === null
    ) {
       
      alert('Element/s not found')
      return
    }

    modalElement.addEventListener('mdsModalClose', () => {
      setOpened(false)
    })
    modalElement.addEventListener('mdsModalHide', () => {
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
        position="center"
        id="modal"
        opened={opened === true ? true : undefined}
      >
        <mds-url-view
          id="url-view"
          class="max-w-screen-tablet w-full"
          slot="window"
          {...args}
        />
      </mds-modal>
    </div>
  )
}

export const Default = {
  render: Template,

  args: {
    src: urlPage,
  },
}

export const Label = {
  render: Template,

  args: {
    src: urlPage,
    label: 'Fake landing page',
  },
}

export const Icon = {
  render: Template,

  args: {
    src: urlPage,
    icon: 'mgg/google-book-large',
  },
}
