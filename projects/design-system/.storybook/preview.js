import React from 'react'
import { addDecorator } from '@storybook/react'
import Page from '@Gatsby/Page/Page'
// import faker from 'faker'
// faker.locale = 'it'

// vendors
import '../node_modules/normalize.css/normalize.css'
import '../node_modules/@maggioli-common/mgg-icons/mgg-icons.css'
import '../node_modules/typeface-karla/index.css'
import '../node_modules/typeface-roboto/index.css'

// design system base styles
import './storybook.scss'
import '../src/scss/import-global.scss'

import media from '+Tokens/css-tokens/media.json'
import palette from '+Tokens/properties/color/base.json'
const paletteColors = palette.color

const toUpperCase = string => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const decorateColor = (group, name, item, color) => {
  return {
    name: `${toUpperCase(group)} ${toUpperCase(name)} ${item.replace('c-', '')}`,
    value: color.value,
  }
}

const decorateViewport = (name, item) => {
  const re = /\d{1,4}/i
  return {
    name: toUpperCase(name),
    type: name,
    styles: {
      width: `${item.match(re)[0]}px`,
      height: '100%',
    },
  }
}

const viewportKeys = Object.keys(media)
const viewports = {}

viewportKeys.forEach(viewportKeys => {
  viewports[viewportKeys] = decorateViewport(viewportKeys, media[viewportKeys])
})

const colors = []

for (const [group, groupObject] of Object.entries(paletteColors)) {
  for (const [name, themeObject] of Object.entries(groupObject)) {
    for (const [theme, colorsObject] of Object.entries(themeObject)) {
      if (theme === 'light') {
        for (const [item, color] of Object.entries(colorsObject)) {
          colors.push(decorateColor(group, name, item, color))
        }
      }
    }
  }
}

export const parameters = {
  backgrounds: {
    default: 'Adjust Tone color',
    values: colors,
  },
  viewport: {
    viewports,
  },
}

addDecorator(storyFn => <Page>{storyFn()}</Page>)
