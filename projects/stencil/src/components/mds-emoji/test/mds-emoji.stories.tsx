import { h } from '@stencil/core'
import { useEffect, useState, Fragment } from 'react'

export default {
  title: 'UI / Emoji',
  argTypes: {
    name: {
      type: { name: 'string' },
      description: 'If set, the component will have an arrow pointing to the caller',
    },
  },
}

const Template = () => {
  const [svgSize, setSvgSize] = useState(256)
  const [followMouse, setFollowMouse] = useState(true)
  const [eyeBlinking, setEyeBlinking] = useState(true)
  const [thinking, setThinking] = useState(false)
  useEffect(() => {
    const emoji = document.querySelector('mds-emoji')
    const followMouseSwitch = document.getElementById('follow-mouse') as HTMLMdsInputSwitchElement
    const eyeBlinkingSwitch = document.getElementById('eye-blinking') as HTMLMdsInputSwitchElement
    const buttonAgree = document.getElementById('agree') as HTMLMdsButtonElement
    const buttonDisagree = document.getElementById('disagree') as HTMLMdsButtonElement
    const thinkSwitch = document.getElementById('think') as HTMLMdsInputSwitchElement
    const sizeRange = document.getElementById('size') as HTMLMdsInputRangeElement
    if (!followMouseSwitch) return

    if (followMouse) emoji?.startFollowMouse()
    if (eyeBlinking) emoji?.startBlinking()
    if (thinking) emoji?.startThinking()

    followMouseSwitch.addEventListener('mdsInputSwitchChange', (event: CustomEvent) => {
      setFollowMouse(event.detail.checked === true)
      if (event.detail.checked === true) {
        emoji?.startFollowMouse()
      } else {
        emoji?.stopFollowMouse()
      }
    })

    eyeBlinkingSwitch.addEventListener('mdsInputSwitchChange', (event: CustomEvent) => {
      // console.log(event.detail.checked)
      setEyeBlinking(event.detail.checked === true)
      if (event.detail.checked === true) {
        emoji?.startBlinking()
      } else {
        emoji?.stopBlinking()
      }
    })

    sizeRange.addEventListener('mdsInputRangeChange', (event: CustomEvent) => {
      setSvgSize(event.detail)
    })

    buttonAgree.addEventListener('click', () => {
      emoji?.agree()
    })

    buttonDisagree.addEventListener('click', () => {
      emoji?.disagree(2000)
    })

    thinkSwitch.addEventListener('mdsInputSwitchChange', (event: CustomEvent) => {
      setThinking(event.detail.checked === true)
      if (event.detail.checked === true) {
        emoji?.startThinking()
      } else {
        emoji?.stopThinking()
      }
    })

  }, [])
  return <div class="grid grid-cols-[300px_auto] gap-600 -m-600 min-h-dvh bg-tone-neutral-10">
    <div class="grid gap-200 auto-rows-min p-600">
      <mds-input-switch id="follow-mouse" size='sm' checked={followMouse || undefined}>Follow mouse</mds-input-switch>
      <mds-input-switch id="eye-blinking" size='sm' checked={eyeBlinking || undefined}>Eye blinking</mds-input-switch>
      <mds-input-range id="size" min={24} max={320} step={8} value={svgSize}></mds-input-range>
      <mds-input-switch id="think" size='sm' checked={thinking || undefined}>Think</mds-input-switch>
      <mds-button id="agree" variant="success" tone="weak">Agree</mds-button>
      <mds-button id="disagree" variant="error" tone="weak">Disgree</mds-button>
    </div>
    <div class="flex items-center justify-center bg-tone-neutral rounded-2xl shadow-md m-600 ml-0">
      <mds-emoji style={{ width: `${svgSize}px`, height: `${svgSize}px` }} name="hexabot" />
    </div>
  </div>
}

const TemplateHeader = () => {
  const [modalOpened, setModalOpen] = useState(false)
  const [modalResultsOpened, setModalResultsOpen] = useState(false)
  const [showResults, setShowResults] = useState(false)
  useEffect(() => {
    const emoji = document.querySelector('#emoji') as HTMLMdsEmojiElement
    const modal = document.querySelector('#modal') as HTMLMdsModalElement
    const modalResults = document.querySelector('#modal-results') as HTMLMdsModalElement
    if (emoji) {
      emoji.startFollowMouse()
      emoji.startBlinking()
    }

    if (modal) {
      modal.addEventListener('mdsModalClose', () => {
        closeModal()
      })
    }

    if (modalResults) {
      modalResults.addEventListener('mdsModalClose', () => {
        closeModalResults()
      })
    }
  }, [])

  const openModal = () => {
    const emoji = document.querySelector('#emoji') as HTMLMdsEmojiElement
    const input = document.querySelector('#input') as HTMLMdsInputElement
    input.setFocus()
    setModalOpen(true)
    emoji?.agree()
    setTimeout(() => {
      emoji?.stopFollowMouse()
    }, 2000)
  }

  const closeModal = () => {
    setModalOpen(false)
    const emoji = document.querySelector('#emoji') as HTMLMdsEmojiElement
    emoji?.startFollowMouse()
  }

  const openModalResults = () => {
    const emojiResults = document.querySelector('#emoji-results') as HTMLMdsEmojiElement
    emojiResults.startThinking()
    emojiResults.startBlinking()
    setModalResultsOpen(true)
    closeModal()
    setTimeout(() => {
      emojiResults.stopThinking()
      emojiResults.agree()
      emojiResults.startFollowMouse()
      setShowResults(true)
    }, 3000)
  }

  const closeModalResults = () => {
    const emojiResults = document.querySelector('#emoji-results') as HTMLMdsEmojiElement
    const emoji = document.querySelector('#emoji') as HTMLMdsEmojiElement
    emoji?.startFollowMouse()
    emojiResults.stopFollowMouse()
    emojiResults.stopBlinking()
    setShowResults(false)
  }

  return (<Fragment>
    <mds-header nav="all" menu="none">
      <mds-header-bar>
        <mds-img class="w-1000" src="/logo-gruppo-maggioli.svg" ></mds-img>
        <mds-emoji id="emoji" name="hexabot" class="w-900 h-900 cursor-pointer" slot="nav" onClick={openModal} />
        <mds-button-dropdown variant="dark" tone="weak" slot="nav" label='Account'>
          <mds-button variant='light' size='sm'>Settings</mds-button>
          <mds-button variant='light' size='sm'>Options</mds-button>
          <mds-button variant='light' size='sm'>Logout</mds-button>
        </mds-button-dropdown>
      </mds-header-bar>
    </mds-header>
    <mds-modal id="modal" opened={modalOpened === true ? true : undefined} onMdsModalClose={() => closeModal()} position="top">
      <div slot="window" class="max-w-[600px] w-full overflow-hidden grid rounded-xl shadow-lg bg-tone-neutral">
        <div class="flex gap-400 p-600">
          <mds-input id="input" class="flex-grow" variant="ai" placeholder='Hi, feel free to ask me something...' mic></mds-input>
          <mds-button icon="mi/baseline/chevron-right" class="shrink-0" variant="ai" tone="weak" size="lg" onClick={() => {openModalResults()}}></mds-button>
        </div>
        {/* <mds-hr class="bg-variant-ai-09 rounded-none h-50"></mds-hr>
        <mds-tab class="rounded-none bg-variant-ai-10" style={{ '--mds-tab-tabs-background': 'var(--variant-ai-10)', '--mds-tab-tabs-padding': '16px' }}>
          <mds-tab-item selected>Ricerche rapide</mds-tab-item>
          <mds-tab-item>Volumi</mds-tab-item>
        </mds-tab>
        <mds-hr class="bg-variant-ai-09 rounded-none h-50"></mds-hr> */}
        <div class="grid gap-200 p-600 bg-variant-ai-10">
          <mds-text typography="label">Esempi di uilizzo</mds-text>
          <mds-button icon="mi/baseline/search" class="justify-start" variant="ai" tone="weak">Trovami documenti che parlano di infrazioni stradali di massimo 6 mesi fa</mds-button>
          <mds-button icon="mi/baseline/search" class="justify-start" variant="ai" tone="weak">Cerca volumi sui fallimenti aziendali solo per aziende di grandi dimensioni</mds-button>
        </div>
      </div>
    </mds-modal>
    <mds-modal id="modal-results" opened={modalResultsOpened === true ? true : undefined} position="right">
      <div class="p-600 grid gap-600 auto-rows-min">
        <mds-emoji id="emoji-results" name="hexabot" class="w-1800 h-1800 m-auto" />
        { showResults && <div class="grid gap-600">
          <div class="p-600 bg-tone-neutral-10 rounded-lg">
            <mds-text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis doloremque asperiores voluptatibus eveniet enim sequi veniam excepturi dignissimos quas molestias illum, at iste temporibus amet tenetur cum praesentium, minus magnam?</mds-text>
          </div>
          <mds-input id="input-results" class="flex-grow" variant="ai" placeholder='Hi, feel free to ask me something...' mic></mds-input>
        </div> }
      </div>
    </mds-modal>
  </Fragment>
  )
}


export const Default = Template.bind({})

export const HeaderExample = TemplateHeader.bind({})
