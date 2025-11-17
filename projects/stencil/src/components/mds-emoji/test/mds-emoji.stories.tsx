import { h } from '@stencil/core'
// import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { nameDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Emoji',
  argTypes: {
    name: {
      type: { name: 'string' },
      options: nameDictionary,
      control: { type: 'select' },
      description:
        'If set, the component will have an arrow pointing to the caller',
    },
  },
}

const Template = args => {
  const [svgSize, setSvgSize] = useState(256)
  const [followMouse, setFollowMouse] = useState(true)
  const [eyeBlinking, setEyeBlinking] = useState(true)
  const [thinking, setThinking] = useState(false)
  useEffect(() => {
    const emoji = document.querySelector('mds-emoji')
    const followMouseSwitch = document.getElementById(
      'follow-mouse',
    ) as HTMLMdsInputSwitchElement
    const eyeBlinkingSwitch = document.getElementById(
      'eye-blinking',
    ) as HTMLMdsInputSwitchElement
    const buttonAgree = document.getElementById(
      'agree',
    ) as HTMLMdsButtonElement
    const buttonDisagree = document.getElementById(
      'disagree',
    ) as HTMLMdsButtonElement
    const thinkSwitch = document.getElementById(
      'think',
    ) as HTMLMdsInputSwitchElement
    const sizeRange = document.getElementById(
      'size',
    ) as HTMLMdsInputRangeElement
    if (!followMouseSwitch) return

    if (followMouse) emoji?.startFollowMouse()
    if (eyeBlinking) emoji?.startBlinking()
    // if (thinking) emoji?.startThinking()

    followMouseSwitch.addEventListener(
      'mdsInputSwitchChange',
      (event: CustomEvent) => {
        setFollowMouse(event.detail.checked === true)
        if (event.detail.checked === true) {
          emoji?.startFollowMouse()
        } else {
          emoji?.stopFollowMouse()
        }
      },
    )

    eyeBlinkingSwitch.addEventListener(
      'mdsInputSwitchChange',
      (event: CustomEvent) => {
        // console.log(event.detail.checked)
        setEyeBlinking(event.detail.checked === true)
        if (event.detail.checked === true) {
          emoji?.startBlinking()
        } else {
          emoji?.stopBlinking()
        }
      },
    )

    sizeRange.addEventListener('mdsInputRangeChange', (event: CustomEvent) => {
      setSvgSize(event.detail)
    })

    buttonAgree.addEventListener('click', () => {
      // emoji?.agree()
    })

    buttonDisagree.addEventListener('click', () => {
      // emoji?.disagree(2000)
    })

    thinkSwitch.addEventListener(
      'mdsInputSwitchChange',
      (event: CustomEvent) => {
        setThinking(event.detail.checked === true)
        if (event.detail.checked === true) {
          // emoji?.startThinking()
        } else {
          // emoji?.stopThinking()
        }
      },
    )
  }, [])
  return (
    <div class="grid grid-cols-[300px_auto] gap-600 -m-600 min-h-dvh bg-tone-neutral-10">
      <div class="grid gap-200 auto-rows-min p-600">
        <mds-input-switch
          id="follow-mouse"
          size="sm"
          checked={followMouse || undefined}
        >
          Follow mouse
        </mds-input-switch>
        <mds-input-switch
          id="eye-blinking"
          size="sm"
          checked={eyeBlinking || undefined}
        >
          Eye blinking
        </mds-input-switch>
        <mds-input-range
          id="size"
          min={24}
          max={320}
          step={8}
          value={svgSize}
        ></mds-input-range>
        <mds-input-switch id="think" size="sm" checked={thinking || undefined}>
          Think
        </mds-input-switch>
        <mds-button id="agree" variant="success" tone="weak">
          Agree
        </mds-button>
        <mds-button id="disagree" variant="error" tone="weak">
          Disgree
        </mds-button>
      </div>
      <div class="flex items-center justify-center bg-tone-neutral rounded-2xl shadow-md m-600 ml-0">
        <mds-emoji
          style={{ width: `${svgSize}px`, height: `${svgSize}px` }}
          {...args}
        />
      </div>
    </div>
  )
}


export const Default = {
  render: Template,
}
