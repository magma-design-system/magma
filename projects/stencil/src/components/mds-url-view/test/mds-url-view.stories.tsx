
import { loadingDictionary } from '@dictionary/loading'
import { h } from '@stencil/core'
import { useEffect, useState } from 'react'
import { iconsDictionary, mggIconsDictionary, svgIconsDictionary } from '@dictionary/icon'

const URLs = [
  'https://www.typeform.com/',
  'http://azumbrunnen.me/',
]

const urlPage = `${location.origin}/iframe.html?id=common-tests--example-page&viewMode=story`

export default {
  title: 'UI / URL View',
  argTypes: {
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon or a base64 string to render it as an svg',
      options: mggIconsDictionary.concat(iconsDictionary).concat(svgIconsDictionary),
      control: { type: 'select' },
    },
    domain: {
      description: 'Specifies if domain is visible on header',
      type: { name: 'boolean' },
    },
    loading: {
      control: { type: 'select' },
      description: 'Specifies whether a browser should load an iframe immediately or to defer loading of images until some conditions are met.',
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

  return <div>
    <mds-button id="action" onClick={() => setOpened(true)}>Open modal</mds-button>
    <mds-modal position="center" id="modal" opened={opened === true ? true : undefined}>
      <mds-url-view class="max-w-lg w-full" slot="window" {...args}/>
    </mds-modal>
  </div>
}

export const Default = Template.bind({})
Default.args = {
  src: urlPage,
}
Default.story = {
  parameters: {
    loki: { skip: true },
  },
}

export const Label = Template.bind({})
Label.args = {
  src: urlPage,
  label: 'Fake landing page',
}

export const Icon = Template.bind({})
Icon.args = {
  src: urlPage,
  icon: 'mgg/google-book-large',
}
