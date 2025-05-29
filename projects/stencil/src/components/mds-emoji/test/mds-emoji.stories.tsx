import { h } from '@stencil/core'
import { useEffect, useState } from 'react'

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
  useEffect(() => {
    const emoji = document.querySelector('mds-emoji')
    const followMouseSwitch = document.getElementById('follow-mouse') as HTMLMdsInputSwitchElement
    const eyeBlinkingSwitch = document.getElementById('eye-blinking') as HTMLMdsInputSwitchElement
    const sizeRange = document.getElementById('size') as HTMLMdsInputRangeElement
    if (!followMouseSwitch) return

    followMouseSwitch.checked = true
    eyeBlinkingSwitch.checked = true
    emoji?.startFollowMouse()
    emoji?.startBlinking()

    followMouseSwitch.addEventListener('mdsInputSwitchChange', (event: CustomEvent) => {
      if (event.detail.checked) {
        emoji?.startFollowMouse()
      } else {
        emoji?.stopFollowMouse()
      }
    })

    eyeBlinkingSwitch.addEventListener('mdsInputSwitchChange', (event: CustomEvent) => {
      if (event.detail.checked) {
        emoji?.startBlinking()
      } else {
        emoji?.stopBlinking()
      }
    })

    sizeRange.addEventListener('mdsInputRangeChange', (event: CustomEvent) => {
      setSvgSize(event.detail)
    })

  }, [])
  return <div class="grid grid-cols-[300px_auto] gap-600 -m-600 min-h-dvh bg-tone-neutral-10">
    <div class="grid gap-200 auto-rows-min p-600">
      <mds-input-switch id="follow-mouse" size='sm'>Follow mouse</mds-input-switch>
      <mds-input-switch id="eye-blinking" size='sm'>Eye blinking</mds-input-switch>
      <mds-input-range id="size" min={24} max={320} step={8} value={320}></mds-input-range>
    </div>
    <div class="flex items-center justify-center bg-tone-neutral rounded-2xl shadow-md m-600 ml-0">
      <mds-emoji style={{ width: `${svgSize}px`, height: `${svgSize}px` }} name="hexabot" />
    </div>
  </div>
}


export const Default = Template.bind({})

