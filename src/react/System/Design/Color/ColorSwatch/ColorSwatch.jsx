import React from 'react'
import PropTypes from 'prop-types'
import './ColorSwatch.scss'

import AccessibilityTest from '@System/Design/Color/AccessibilityTest/AccessibilityTest'
import Caption from '@Typography/Caption/Caption'
import Grid from '@Layout/Grid/Grid'
import H6 from '@Typography/H6/H6'

const ColorSwatch = props =>
  <Grid className={`mds-color-swatch ${props.className}`}>
    <div className="mds-color-swatch__title">
      <H6>{ props.colorBaseCode }</H6>
      { props.colorSeedHref && <a className="mds-color-swatch__seed text-primary text-primary--h6" href={props.colorSeedHref}>seed</a>}
    </div>
    <Caption className="mds-color-swatch__infos">
      <AccessibilityTest base={props.colorBaseHexTest} color={props.colorTextHexTest}/>
      <div>Text { props.colorTextCode }</div>
    </Caption>
  </Grid>

ColorSwatch.propTypes = {
  className: PropTypes.string,
  colorBaseCode: PropTypes.string,
  colorBaseHexTest: PropTypes.string,
  colorSeedHref: PropTypes.string,
  colorTextCode: PropTypes.string,
  colorTextHexTest: PropTypes.string,
}

ColorSwatch.defaultProps = {
  className: '',
  colorBaseCode: 'Base',
  colorBaseHexTest: '#000000',
  colorSeedHref: null,
  colorTextCode: 'Code',
  colorTextHexTest: '#ffffff',
}

export default ColorSwatch
