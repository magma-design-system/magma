import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import './ColorSwatch.scss'

import AccessibilityTest from '@Gatsby/Pattern/AccessibilityTest/AccessibilityTest'
import Caption from '@Typography/Caption/Caption'
import H2 from '@Typography/H2/H2'
import Grid from '@Layout/Grid/Grid'

const ColorSwatchItem = props =>
  <Grid className="gap-3 group">
    <div>
      <div className={`${props.className} pt-1/1 relative width-full flex items-center justify-center rounded-full`}>
        <H2 className="absolute width-full top-1/2 transform -translate-y-2/4">
          { props.colorBaseCode }
        </H2>
      </div>
    </div>
    <Grid className="text-center gap-0">
      <Caption>{ props.colorTextCode }/{ props.colorBaseCode }</Caption>
      <Caption htmlTag="div" className="text-center">
        <AccessibilityTest base={props.colorBaseHexTest} color={props.colorTextHexTest}/>
      </Caption>
    </Grid>
  </Grid>

ColorSwatchItem.propTypes = {
  className: PropTypes.string,
  colorBaseCode: PropTypes.string,
  colorBaseHexTest: PropTypes.string,
  colorSeedHref: PropTypes.string,
  colorTextCode: PropTypes.string,
  colorTextHexTest: PropTypes.string,
  group: PropTypes.string,
  name: PropTypes.string,
}

ColorSwatchItem.defaultProps = {
  className: '',
  colorBaseCode: 'code',
  colorBaseHexTest: '#000000',
  colorSeedHref: null,
  colorTextCode: 'Code',
  colorTextHexTest: '#ffffff',
  group: 'Group',
  name: 'Name',
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
  group: PropTypes.string,
  name: PropTypes.string,
}

ColorSwatch.defaultProps = {
  className: '',
  colorBaseCode: 'Base',
  colorBaseHexTest: '#000000',
  colorSeedHref: null,
  colorTextCode: 'Code',
  colorTextHexTest: '#ffffff',
  group: 'Group',
  name: 'Name',
}

export default ColorSwatch
