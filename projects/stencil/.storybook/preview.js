import { defineCustomElements } from '../dist/esm/loader'

import 'normalize.css'
import '@maggioli-design-system/styles/dist/css/hydrated.css'
import '@maggioli-design-system/styles/dist/css/colors-rgb.css'
import '@maggioli-design-system/styles/dist/css/globals.css'
import '@maggioli-design-system/styles/dist/css/animations.css'
import '@maggioli-design-system/styles/dist/css/reset.css'
import '@maggioli-design-system/styles/dist/css/base.css'
import '@fontsource/karla/400.css'
import '@fontsource/karla/700.css'
import '@fontsource/merriweather/300.css'
import '@fontsource/merriweather/400.css'
import '@fontsource/merriweather/700.css'
import '@fontsource/roboto-mono/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/roboto/900.css'
import './tailwind.css'
import './iconsauce.css'

import devices from './devices.json'
// import media from '@maggioli-design-system/design-tokens/dist/js/tailwind-screens'


defineCustomElements()

const pathName = window.location.pathname.replace('/iframe.html', '')
const svgPath = pathName.charAt(pathName.length - 1) === '/' ? `${pathName}svg/` : `${pathName}/svg/`

window.sessionStorage.setItem('mdsIconSvgPath', svgPath)

const capitalize = string => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const setAccessibility = (preference, value) => {
  const htmlEl = document.querySelector('html')
  htmlEl.style.setProperty(`--magma-pref-${preference}`, value)
  htmlEl.classList.add(`pref-${preference}-${value}`)
  window.localStorage.setItem(`mdsPref${capitalize(preference)}`, value)
}

const checkAccessibility = (pref, defaultValue) => {
  if (window.localStorage.getItem(`mdsPref${capitalize(pref)}`)) {
    const prefValue = window.localStorage.getItem(`mdsPref${capitalize(pref)}`)
    setAccessibility(pref, prefValue)
    return
  }
  setAccessibility(pref, defaultValue)
}

if (window.localStorage.getItem('mdsPrefStorybookPrefs') && window.localStorage.getItem('mdsPrefStorybookPrefs') === 'enabled') {
  checkAccessibility('theme', 'system')
  checkAccessibility('contrast', 'system')
  checkAccessibility('animation', 'system')
  checkAccessibility('consumption', 'high')
}

document.querySelector('html').classList.add('bg-tone-neutral', 'transition-colors')
if (window.localStorage.getItem('mdsPrefLanguage')) {
  document.querySelector('html').setAttribute('lang', window.localStorage.getItem('mdsPrefLanguage'))
}

const parameters = {
  options: {
    storySort: {
      method: 'alphabetical',
    },
  },
  viewport: {
    devices,
    // viewports,
  },
  backgrounds: {
    values: [
      { name: 'White', value: 'rgb(255 255 255)' },
      { name: 'Light', value: 'rgb(var(--tone-neutral-10, 248 248 248))' },
      { name: 'Grey', value: 'rgb(var(--tone-neutral-06, 162 162 162))' },
      { name: 'Dark', value: 'rgb(var(--tone-neutral-01, 33 33 33))' },
      { name: 'Black', value: 'rgb(0 0 0)' },
    ],
    // default: 'White',
  },
}

const decorators = [
  Story => (
    <div className="p-600 min-h-screen">
      <Story />
    </div>
  ),
]

const preview = {
  parameters,
  decorators,
  tags: ['autodocs'],
}

export default preview
