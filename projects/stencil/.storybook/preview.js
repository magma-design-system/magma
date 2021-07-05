import { defineCustomElements } from '../dist/esm/loader';

import 'normalize.css'
import '@maggioli-design-system/design-tokens/dist/css/vars-rgb-channels.css'
import '@maggioli-design-system/icons'
import 'typeface-karla'
import 'typeface-roboto'

import './tailwind.css'

import media from '@maggioli-design-system/design-tokens/dist/css-tokens/media.json'

defineCustomElements();

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

// const req = require.context('../src', true, /\.tsx/);
// if (module.hot) {
//   module.hot.accept(req.id, () => {
//     window.location.reload();
//   });
// }

// console.log(req, module)

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  viewport: {
    viewports,
  },
};
