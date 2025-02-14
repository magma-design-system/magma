import { h } from '@stencil/core'
import { useState, useEffect } from 'react'

export default {
  title: 'Common tests',
}

const Template = () => {
  const [isRendered, setRender] = useState(false)
  useEffect(() => {
    const switchElement = document.querySelector('#toggle')
    if (switchElement) {
      switchElement.addEventListener('mdsInputSwitchChange', (event: CustomEvent) => {
        setRender(event.detail.checked)
      })
    }
  }, [])
  return <div class="grid gap-600">
    <div>
      <mds-input-switch id="toggle">Render component</mds-input-switch>
    </div>
    { isRendered && <div class="grid gap-400">
      <div class="flex bg-tone-neutral-09 p-600 rounded-lg items-center gap-400">
        <mds-button variant="light">This is a rendered component</mds-button>
        <mds-text>Use <mds-text typography='snippet'>hydrated.css</mds-text> from styles to avoid <b>FOUC, Flash of Unstyled Content</b></mds-text>
      </div>
    </div> }
  </div>
}


export const Hydrated = Template.bind({})
