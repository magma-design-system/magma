import { defineCustomElements } from '../dist/esm/loader'

import 'loki/configure-react'

import 'normalize.css'
import '@maggioli-design-system/design-tokens/dist/css/colors-rgb.css'
import '@maggioli-design-system/icons/dist/original/base64/mgg-icons-font-face.css'
import 'typeface-karla'
import 'typeface-roboto'
import './tailwind.css'
import './iconsauce.css'

import devices from './devices.json'
import media from '@maggioli-design-system/design-tokens/dist/css-tokens/media.json'
import { mds_icon_svg } from '../dist/esm/mds-icon-svg.entry'
import { MdsIconSvg } from '../dist/components/mds-icon-svg'

defineCustomElements();

// Method 1 - call static function of MdsIconSvg
const mdsIconSvgGet = async () => {
  await customElements.whenDefined('mds-icon-svg')

  mds_icon_svg.setSvgPathStatic('/svg/')
  // MdsIconSvg.setSvgPathStatic('/svg/') // non va, why?
}

mdsIconSvgGet()

// Method 2 - use of sessionStorage
// window.sessionStorage.setItem('mdsIconSvgPath', '/svg/')

// Method 3 - instantiate a temp MdsIconSvg DOM node element to call a stencil class Method
// const mdsIconSvgGet = async () => {
//   await customElements.whenDefined('mds-icon-svg')

//   const mdsIconSvg = document.createElement('mds-icon-svg')

//   document.body.appendChild(mdsIconSvg)

//   if ('setSvgPath' in mdsIconSvg) {
//     mdsIconSvg.setSvgPath('/svg/')
//   }

//   document.body.removeChild(mdsIconSvg)
// }

// mdsIconSvgGet()

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

const viewportKeys = Object.keys(media)
const viewports = {}

viewportKeys.forEach(viewportKeys => {
  viewports[viewportKeys] = decorateViewport(viewportKeys, media[viewportKeys])
})

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  viewport: {
    devices,
    viewports,
  },
}

export const decorators = [
  (Story) => (
    <div className="p-4">
      <Story />
    </div>
  ),
];
