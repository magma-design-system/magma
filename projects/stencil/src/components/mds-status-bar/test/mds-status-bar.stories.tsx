import { h } from '@stencil/core'
import { useState } from 'react'

export default {
  title: 'UI / Status bar',
  argTypes: {
    description: {
      type: { name: 'string' },
      description: 'Specifies the description near the slotted actions',
    },
    visible: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is visible',
    },
  },
}

const Template = args => {
  let statusBar: HTMLMdsStatusBarElement | null = document.querySelector('mds-status-bar') as HTMLMdsStatusBarElement
  let cancel: HTMLMdsButtonElement | null = document.querySelector('#cancel') as HTMLMdsButtonElement
  let confirm: HTMLMdsButtonElement | null = document.querySelector('#confirm') as HTMLMdsButtonElement

  const [buttonState, setButtonState] = useState(0)

  const iconMap = {
    0: 'mi/baseline/done',
    1: undefined,
    2: 'mi/baseline/done-all',
  }

  const variantsMap = {
    0: 'primary',
    1: 'primary',
    2: 'success',
  }

  const tonesMap = {
    0: 'strong',
    1: 'weak',
    2: 'strong',
  }

  function setLoadingState () {
    setButtonState(1)
    cancel = document.querySelector('#cancel') as HTMLMdsButtonElement
    cancel.disabled = true
    setTimeout(() => {
      confirm = document.querySelector('#confirm') as HTMLMdsButtonElement
      setButtonState(2)
      confirm.disabled = true
      setTimeout(() => {
        statusBar?.hide()
      }, 1000)
      setTimeout(() => {
        setButtonState(0)
      }, 1500)
    }, 2000)
  }

  return (
    <div>
      <mds-button onClick={() => {
        statusBar = document.querySelector('mds-status-bar') as HTMLMdsStatusBarElement
        if (statusBar) statusBar.visible = true
        if (cancel) cancel.disabled = undefined
        if (confirm) confirm.disabled = undefined
      }}>Edit stuff</mds-button>
      <mds-status-bar {...args}>
        <mds-button id="cancel" variant="dark" tone="weak" onClick={(e: MouseEvent) => {
          (e.target as HTMLElement).closest('mds-status-bar')?.hide()
        }}>Annulla</mds-button>
        <mds-button id="confirm" icon={iconMap[buttonState]} variant={variantsMap[buttonState]} tone={tonesMap[buttonState]} await={buttonState === 1} onClick={() => { if (buttonState === 0) setLoadingState() }}>
          { buttonState === 0 && 'Conferma azione' }
          { buttonState === 1 && 'Salvataggio in corso...' }
          { buttonState === 2 && 'Salvataggio riuscito' }
        </mds-button>
      </mds-status-bar>
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {
  description: 'Stai modificando 4 elementi',
}
