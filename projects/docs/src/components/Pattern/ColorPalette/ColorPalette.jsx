import React from 'react'
import PropTypes from 'prop-types'
import './ColorPalette.scss'

import contrast from 'get-contrast'

import ColorSwatch from '@Gatsby/Pattern/ColorSwatch/ColorSwatch'
import Grid from '@Layout/Grid/Grid'
import H3 from '@Typography/H3/H3'

function getColor(token, index) {
  const colorValue = token[Object.keys(token)[index]].value
  const colorCode = Object.keys(token)[index] !== 'color' ? Number(Object.keys(token)[index]) : ''
  const selectorCode = typeof colorCode === 'number' && colorCode < 10 ? `0${colorCode}` : colorCode.toString()
  return {
    code: selectorCode,
    selectorCode,
    value: colorValue,
  }
}

function getBestContrastColor(token, index) {
  const currentColor = getColor(token, index)
  let bestColor = {}
  let bestRatio = 0
  Object.entries(token).forEach((_value, key) => {
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
  const color = getColor(token, index).selectorCode !== '' ? '-' + getColor(token, index).selectorCode : getColor(token, index).selectorCode
  const bestColor = getBestContrastColor(token, index).selectorCode !== '' ? '-' + getBestContrastColor(token, index).selectorCode : getBestContrastColor(token, index).selectorCode
  return `background-color-${group}-${name}${color} color-${group}-${name}${bestColor}`
}

const ColorPalette = props =>
  <Grid gutter="small" className={`mds-color-palette ${props.className}`}>
    <H3 className="mds-color-palette__title">{ props.group } { props.name }</H3>
    <Grid template="auto-fit">
      {
        Object.entries(props.token).map(([code, color], key) =>
          <ColorSwatch
            key={key}
            className={`${getSelectors(props.token, props.group, props.name, key)}`}
            colorBaseCode={Number(code) < 10 ? `0${code}` : code }
            colorBaseHexTest={color.value}
            colorSeedHref={code === 'color' ? color.comment : null}
            colorTextCode={getBestContrastColor(props.token, key).code}
            colorTextHexTest={getBestContrastColor(props.token, key).value}
            group={props.group}
            name={props.name}
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
