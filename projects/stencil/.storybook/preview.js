import { defineCustomElements } from '../dist/esm/loader'

import 'normalize.css'
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


defineCustomElements();

const pathName = window.location.pathname.replace('/iframe.html', '')
const svgPath = pathName.charAt(pathName.length - 1) === '/' ? `${pathName}svg/` : `${pathName}/svg/`

// Method 1 - call static function of MdsIcon

// import { mds_icon } from '../dist/esm/mds-icon.entry'
// const mdsIconGet = async () => {
//   await customElements.whenDefined('mds-icon')
//   mds_icon.setSvgPathStatic(svgPath)
// }
// mdsIconGet()

// Method 2 - use of sessionStorage
window.sessionStorage.setItem('mdsIconSvgPath', svgPath)

// Method 3 - instantiate a temp MdsIcon DOM node element to call a stencil class Method
// const mdsIconGet = async () => {
//   await customElements.whenDefined('mds-icon')

//   const mdsIcon = document.createElement('mds-icon')

//   document.body.appendChild(mdsIcon)

//   if ('setSvgPath' in mdsIcon) {
//     mdsIcon.setSvgPath('/svg/')
//   }

//   document.body.removeChild(mdsIcon)
// }

// mdsIconGet()

const setAccessibility = (preference, value) => {
  const htmlEl = document.querySelector('html')
  htmlEl.style.setProperty(`--magma-pref-${preference}`, value)
  htmlEl.classList.add(`pref-${preference}-${value}`)
  window.localStorage.setItem(`mds-pref-${preference}`, value)
}

const checkAccessibility = (pref, defaultValue) => {
  if (window.localStorage.getItem(`mds-pref-${pref}`)) {
    const prefValue = window.localStorage.getItem(`mds-pref-${pref}`)
    setAccessibility(pref, prefValue)
    return
  }
  setAccessibility(pref, defaultValue)
}

checkAccessibility('theme', 'system')
checkAccessibility('contrast', 'system')
checkAccessibility('animation', 'system')
checkAccessibility('consumption', 'high')

document.querySelector('html').classList.add('bg-tone-neutral', 'transition-colors')
document.querySelector('html').setAttribute('lang', window.localStorage.getItem('language') ?? 'it')

const toUpperCase = string => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const decorateViewport = (name, item) => {
  const re = /\d{1,4}/i
  return {
    name: toUpperCase(name),
    type: name,
    styles: {
      width: `${typeof item === 'object' ? item[Object.keys(item)[0]] : item.match(re)[0]}`,
      height: '100%',
    },
  }
}

// const viewportKeys = Object.keys(media)
// const viewports = {}

// viewportKeys.forEach(viewportKeys => {
//   viewports[viewportKeys] = decorateViewport(viewportKeys, media[viewportKeys])
// })

const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  viewport: {
    devices,
    // viewports,
  },
}

const decorators = [
  (Story) => (
    <div className="p-4">
      <Story />
    </div>
  ),
];

const preview = {
  parameters,
  decorators,
}

export default preview
