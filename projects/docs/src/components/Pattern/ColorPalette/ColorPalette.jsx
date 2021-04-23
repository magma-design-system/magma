import React from 'react'
import PropTypes from 'prop-types'
import './ColorPalette.scss'

import contrast from 'get-contrast'

import ColorSwatch from '@Gatsby/Pattern/ColorSwatch/ColorSwatch'
import Grid from '@Layout/Grid/Grid'
import H3 from '@Typography/H3/H3'
import Hack from '@Typography/Hack/Hack'

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
    <Grid template="color-palette">
      {
        Object.entries(props.token).map(([code, color], key) =>
          <Grid gutter="small" className="mds-color-palette__item" key={key}>
            <ColorSwatch
              className={`${getSelectors(props.token, props.group, props.name, key)}`}
              colorBaseCode={code}
              colorBaseHexTest={color.value}
              colorSeedHref={code === 'color' ? color.comment : null}
              colorTextCode={getBestContrastColor(props.token, key).code}
              colorTextHexTest={getBestContrastColor(props.token, key).value}
              group={props.group}
              name={props.name}
            />
            <Grid gutter="xsmall" className="mds-color-palette__doc">
              <Hack><span className="mds-color-palette__lang">CSS</span> --hex-{props.group}-{props.name}-{ code.replace('c-', '') }</Hack>
              <Hack><span className="mds-color-palette__lang">SCSS</span> color('{props.group}.{props.name}', '{ code.replace('c-', '') }');</Hack>
            </Grid>
          </Grid>,
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
