import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import './ColorSwatch.scss'

import AccessibilityTest from '@System/Design/Color/AccessibilityTest/AccessibilityTest'
import Caption from '@Typography/Caption/Caption'
import Grid from '@Layout/Grid/Grid'
import Row from '@Layout/Row/Row'
import H6 from '@Typography/H6/H6'
import Icon from '@Design/Icon/Icon'

const ColorSwatchItem = props =>
  <Grid className={`mds-color-swatch ${props.className}`}>
    <Grid gutter="none" className="mds-color-swatch__title">
      <H6>{ props.colorBaseCode }</H6>
      { props.colorSeedHref &&
        <Row gutter="xsmall" align="center">
          <Icon name="colorSeed"/>
          <div className="text-secondary text-secondary--caption">Go to color seed</div>
        </Row>
      }
    </Grid>
    <Caption htmlTag="div" className="mds-color-swatch__infos">
      <AccessibilityTest base={props.colorBaseHexTest} color={props.colorTextHexTest}/>
      <div>Text { props.colorTextCode }</div>
    </Caption>
  </Grid>

ColorSwatchItem.propTypes = {
  className: PropTypes.string,
  colorBaseCode: PropTypes.string,
  colorBaseHexTest: PropTypes.string,
  colorSeedHref: PropTypes.string,
  colorTextCode: PropTypes.string,
  colorTextHexTest: PropTypes.string,
}

ColorSwatchItem.defaultProps = {
  className: '',
  colorBaseCode: 'code',
  colorBaseHexTest: '#000000',
  colorSeedHref: null,
  colorTextCode: 'Code',
  colorTextHexTest: '#ffffff',
}

const ColorSwatch = props =>
  <Fragment>
    { props.colorSeedHref
      ? <a href={props.colorSeedHref} target="_blank"> <ColorSwatchItem {...props} /> </a>
      : <ColorSwatchItem {...props} />
    }
  </Fragment>

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
