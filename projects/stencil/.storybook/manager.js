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

  const setLanguage = (lang) => {
    if (window) {
      window.localStorage.setItem('mds-pref-language', lang)
    }
    if (document) {
      const iframe = document.getElementById('storybook-preview-iframe')
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document
      iframeDocument.querySelector('html').setAttribute('lang', window.localStorage.getItem('mds-pref-language') ?? 'it')
    }
  }

  return (
    <Form>
      <Form.Field label="Theme">
        <Form.Select
          name="pref-theme"
          defaultValue={ window.localStorage.getItem('mds-pref-theme') ?? 'light' }
          onChange={(event) => { setAccessibility('theme', event.target.value, ['light', 'system', 'dark']) }}
        >
          <option value="light">Light</option>
          <option value="system">System</option>
          <option value="dark">Dark</option>
        </Form.Select>
      </Form.Field>
      <Form.Field label="Contrast">
        <Form.Select
          name="pref-contrast"
          defaultValue={ window.localStorage.getItem('mds-pref-contrast') ?? 'no-preference' }
          onChange={(event) => { setAccessibility('contrast', event.target.value, ['more', 'system', 'no-preference']) }}
        >
          <option value="more">More</option>
          <option value="system">System</option>
          <option value="no-preference">No preference</option>
        </Form.Select>
      </Form.Field>
      <Form.Field label="Animations">
        <Form.Select
          name="pref-animation"
          defaultValue={ window.localStorage.getItem('mds-pref-animation') ?? 'no-preference' }
          onChange={(event) => { setAccessibility('animation', event.target.value, ['reduce', 'system', 'no-preference']) }}
        >
          <option value="reduce">Reduce</option>
          <option value="system">System</option>
          <option value="no-preference">No preference</option>
        </Form.Select>
      </Form.Field>
      <Form.Field label="Consumption">
        <Form.Select
          name="pref-consumption"
          defaultValue={ window.localStorage.getItem('mds-pref-consumption') ?? 'high' }
          onChange={(event) => { setAccessibility('consumption', event.target.value, ['low', 'medium', 'high']) }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Form.Select>
      </Form.Field>
      <Form.Field label="Language">
        <Form.Select
          name="pref-language"
          defaultValue={ window.localStorage.getItem('mds-pref-language') ?? 'en' }
          onChange={(event) => { setLanguage(event.target.value) }}
        >
          <option value="it">Italiano</option>
          <option value="en">English</option>
          <option value="el">Ελληνικά (Greek)</option>
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
