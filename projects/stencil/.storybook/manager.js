import React from 'react'
import { AddonPanel, Form } from '@storybook/components'
import { useGlobals, addons, types } from '@storybook/manager-api'
import themeMaggioli from './theme'

const AccessibilityPanel = () => {
  const setAccessibility = (preference, value, list) => {
    const iframe = document.getElementById('storybook-preview-iframe')
    if (iframe) {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document
      const htmlEl = iframeDocument.querySelector('html')
      for (const key in list) {
        htmlEl.classList.remove(`pref-${preference}-${list[key]}`)
      }
      htmlEl.style.setProperty(`--magma-pref-${preference}`, value)
      htmlEl.classList.add(`pref-${preference}-${value}`)
      window.localStorage.setItem(`mds-pref-${preference}`, value)
    }
  }

  const isSelected = (preference, value) => {
    if (window) {
      return window.localStorage.getItem(`mds-pref-${preference}`) === value
    }
    return false
  }

  const isLangSelected = (lang) => {
    if(window) {
      return window.localStorage.getItem('language') === lang
    }
    return false
  }

  const setLanguage = (lang) => {
    if (window) {
      window.localStorage.setItem('language', lang)
    }
    if (document) {
      const iframe = document.getElementById('storybook-preview-iframe')
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document
      iframeDocument.querySelector('html').setAttribute('lang', window.localStorage.getItem('language') ?? 'it')
    }
  }

  return (
    <Form>
      <Form.Field label="Theme">
        <Form.Select
          name="pref-theme"
          onChange={(event) => { setAccessibility('theme', event.target.value, ['light', 'system', 'dark']) }}
        >
          <option selected={isSelected('theme', 'light')} value="light">Light</option>
          <option selected={isSelected('theme', 'system')} value="system">System</option>
          <option selected={isSelected('theme', 'dark')} value="dark">Dark</option>
        </Form.Select>
      </Form.Field>
      <Form.Field label="Contrast">
        <Form.Select
          name="pref-contrast"
          onChange={(event) => { setAccessibility('contrast', event.target.value, ['more', 'system', 'no-preference']) }}
        >
          <option selected={isSelected('contrast', 'more')} value="more">More</option>
          <option selected={isSelected('contrast', 'system')} value="system">System</option>
          <option selected={isSelected('contrast', 'no-preference')} value="no-preference">No preference</option>
        </Form.Select>
      </Form.Field>
      <Form.Field label="Animations">
        <Form.Select
          name="pref-animation"
          onChange={(event) => { setAccessibility('animation', event.target.value, ['reduce', 'system', 'no-preference']) }}
        >
          <option selected={isSelected('animation', 'reduce')} value="reduce">Reduce</option>
          <option selected={isSelected('animation', 'system')} value="system">System</option>
          <option selected={isSelected('animation', 'no-preference')} value="no-preference">No preference</option>
        </Form.Select>
      </Form.Field>
      <Form.Field label="Consumption">
        <Form.Select
          name="pref-consumption"
          onChange={(event) => { setAccessibility('consumption', event.target.value, ['low', 'medium', 'high']) }}
        >
          <option selected={isSelected('consumption', 'low')} value="low">Low</option>
          <option selected={isSelected('consumption', 'medium')} value="medium">Medium</option>
          <option selected={isSelected('consumption', 'high')} value="high">High</option>
        </Form.Select>
      </Form.Field>
      <Form.Field label="Language">
        <Form.Select
          name="pref-language"
          onChange={(event) => { setLanguage(event.target.value) }}
        >
          <option selected={isLangSelected('it')} value="it">Italiano</option>
          <option selected={isLangSelected('en')} value="en">English</option>
          <option selected={isLangSelected('br')} value="br">Brasilian (missing example)</option>
        </Form.Select>
      </Form.Field>
    </Form>
  )
}

addons.register('maggioli/panel', () => {
  addons.add('maggioli-addon/accessibility', {
    title: 'Magma accesibility',
    //👇 Sets the type of UI element in Storybook
    type: types.PANEL,
    render: ({ active }) => {
      return (
      <AddonPanel active={active}>
        <AccessibilityPanel/>
      </AddonPanel>
    )},
  })
})

addons.setConfig({
  /**
   * theme storybook, see link below
   */
  theme: themeMaggioli,
})
