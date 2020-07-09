import React from 'react'
import PropTypes from 'prop-types'
import './ColorPalette.scss'

import contrast from 'get-contrast'

import ColorSwatch from '@System/Design/Color/ColorSwatch/ColorSwatch'
import Grid from '@Layout/Grid/Grid'
import H5 from '@Typography/H5/H5'

function getColor(token, index) {
  const colorValue = token[Object.keys(token)[index]].value
  const colorCode = Object.keys(token)[index]
  return {
    code: colorCode,
    selectorCode: colorCode.replace('c-', ''),
    value: colorValue,
  }
}

function getBestContrastColor(token, index) {
  const currentColor = getColor(token, index)
  let bestColor = {}
  let bestRatio = 0
  Object.entries(token).map(([name, color], key) => {
    const checkColor = getColor(token, key)
    const currentRatio = contrast.ratio(currentColor.value, checkColor.value).toFixed(2)
    if (currentRatio > bestRatio) {
      bestRatio = currentRatio
      bestColor = checkColor
    }
  })
  return bestColor
}

function getSelectors(token, group, name, index) {
  return `background-color-${group}-${name}-${getColor(token, index).selectorCode} color-${group}-${name}-${getBestContrastColor(token, index).selectorCode}`
}

const ColorPalette = props =>
  <Grid gutter="small" className={`mds-color-palette ${props.className}`}>
    <H5 className="mds-color-palette__title">{ props.group } { props.name }</H5>
    <Grid columns="3">
      {
        Object.entries(props.token).map(([code, color], key) =>
          <ColorSwatch
            className={`${getSelectors(props.token, props.group, props.name, key)}`}
            key={key}
            colorSeedHref={code === 'color' ? color.comment : null}
            colorBaseCode={code}
            colorBaseHexTest={color.value}
            colorTextCode={getBestContrastColor(props.token, key).code}
            colorTextHexTest={getBestContrastColor(props.token, key).value}
          />,
        )
      }
    </Grid>
  </Grid>

ColorPalette.propTypes = {
  className: PropTypes.string,
  group: PropTypes.string,
  name: PropTypes.string,
  token: PropTypes.object,
}

ColorPalette.defaultProps = {
  className: '',
  group: 'Group',
  name: 'Name',
}

export default ColorPalette
