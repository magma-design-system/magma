import React, { useState } from 'react'
import { AddonPanel, Form } from '@storybook/components'
import { addons, types } from '@storybook/manager-api'
import themeMaggioli from './theme'
import clsx from 'clsx'

const AccessibilityPanel = () => {

  const capitalize = string => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  const setAccessibility = (preference, value, list) => {
    const iframe = document.getElementById('storybook-preview-iframe')
    if (iframe) {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document
      const htmlEl = iframeDocument.querySelector('html')

      if (value === 'unset') {
        htmlEl.removeAttribute('class')
        htmlEl.removeAttribute('style')
        window.localStorage.removeItem(`mdsPref${capitalize(preference)}`)
        return
      }

      for (const key in list) {
        htmlEl.classList.remove(`pref-${preference}-${list[key]}`)
      }
      htmlEl.style.setProperty(`--magma-pref-${preference}`, value)
      htmlEl.classList.add(`pref-${preference}-${value}`)
      window.localStorage.setItem(`mdsPref${capitalize(preference)}`, value)
    }
  }

  const setLanguage = lang => {
    if (window) {
      window.localStorage.setItem('mdsPrefLanguage', lang)
    }
    if (document) {
      const iframe = document.getElementById('storybook-preview-iframe')
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document
      if (lang === 'unset') {
        window.localStorage.removeItem('mdsPrefLanguage')
        iframeDocument.querySelector('html').removeAttribute('lang')
        return
      }
      iframeDocument.querySelector('html').setAttribute('lang', window.localStorage.getItem('mdsPrefLanguage') ?? 'it')
    }
  }

  const checkAccessibilityUse = reset => {
    if (reset) {
      setAccessibility('theme', 'unset')
      setAccessibility('contrast', 'unset')
      setAccessibility('animation', 'unset')
      setAccessibility('consumption', 'unset')
      setLanguage('unset')
      return
    }

    setAccessibility('theme', window.localStorage.getItem('mdsPrefTheme') ?? 'light', ['light', 'system', 'dark'])
    setAccessibility('contrast', window.localStorage.getItem('mdsPrefContrast') ?? 'no-preference', ['more', 'system', 'no-preference'])
    setAccessibility('animation', window.localStorage.getItem('mdsPrefAnimation') ?? 'no-preference', ['reduce', 'system', 'no-preference'])
    setAccessibility('consumption', window.localStorage.getItem('mdsPrefConsumption') ?? 'high', ['low', 'medium', 'high'])
    setLanguage(window.localStorage.getItem('mdsPrefLanguage') ?? 'en')
  }

  let usePrefs = false
  if (window.localStorage.getItem('mdsPrefStorybookPrefs') === 'enable') {
    usePrefs = true
  }

  const [enabled, setEnabledPrefs] = useState(usePrefs)

  const togglePreferences = isEnabled => {
    setEnabledPrefs(isEnabled === 'enable')
    checkAccessibilityUse(enabled)
    window.localStorage.setItem('mdsPrefStorybookPrefs', enabled)
  }

  return (
    <Form>
      <Form.Field label="Preferences">
        <Form.Select
          name="pref-disable"
          defaultValue="disable"
          onChange={event => { togglePreferences(event.target.value) }}
        >
          <option value="enable">Enabled</option>
          <option value="disable">Disabled</option>
        </Form.Select>
      </Form.Field>
      <Form.Field label="Theme">
        <Form.Select
          disabled={!enabled}
          className={clsx(!enabled && 'opacity-30 pointer-events-none')}
          name="pref-theme"
          defaultValue={ window.localStorage.getItem('mdsPrefTheme') ?? 'light' }
          onChange={event => { setAccessibility('theme', event.target.value, ['light', 'system', 'dark']) }}
        >
          <option value="light">Light</option>
          <option value="system">System</option>
          <option value="dark">Dark</option>
          <option value="unset">Unset</option>
        </Form.Select>
      </Form.Field>
      <Form.Field label="Contrast">
        <Form.Select
          disabled={!enabled}
          className={clsx(!enabled && 'opacity-30 pointer-events-none')}
          name="pref-contrast"
          defaultValue={ window.localStorage.getItem('mdsPrefContrast') ?? 'no-preference' }
          onChange={event => { setAccessibility('contrast', event.target.value, ['more', 'system', 'no-preference']) }}
        >
          <option value="more">More</option>
          <option value="system">System</option>
          <option value="no-preference">No preference</option>
          <option value="unset">Unset</option>
        </Form.Select>
      </Form.Field>
      <Form.Field label="Animations">
        <Form.Select
          disabled={!enabled}
          className={clsx(!enabled && 'opacity-30 pointer-events-none')}
          name="pref-animation"
          defaultValue={ window.localStorage.getItem('mdsPrefAnimation') ?? 'no-preference' }
          onChange={event => { setAccessibility('animation', event.target.value, ['reduce', 'system', 'no-preference']) }}
        >
          <option value="reduce">Reduce</option>
          <option value="system">System</option>
          <option value="no-preference">No preference</option>
          <option value="unset">Unset</option>
        </Form.Select>
      </Form.Field>
      <Form.Field label="Consumption">
        <Form.Select
          disabled={!enabled}
          className={clsx(!enabled && 'opacity-30 pointer-events-none')}
          name="pref-consumption"
          defaultValue={ window.localStorage.getItem('mdsPrefConsumption') ?? 'high' }
          onChange={event => { setAccessibility('consumption', event.target.value, ['low', 'medium', 'high']) }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="unset">Unset</option>
        </Form.Select>
      </Form.Field>
      <Form.Field label="Language">
        <Form.Select
          disabled={!enabled}
          className={clsx(!enabled && 'opacity-30 pointer-events-none')}
          name="pref-language"
          defaultValue={ window.localStorage.getItem('mdsPrefLanguage') ?? 'en' }
          onChange={event => { setLanguage(event.target.value) }}
        >
          <option value="it">Italiano</option>
          <option value="en">English</option>
          <option value="el">Ελληνικά (Greek)</option>
          <option value="unset">Unset</option>
        </Form.Select>
      </Form.Field>
    </Form>
  )
}

addons.register('maggioli/panel', () => {
  addons.add('maggioli-addon/accessibility', {
    title: 'Magma accesibility',
    // 👇 Sets the type of UI element in Storybook
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
