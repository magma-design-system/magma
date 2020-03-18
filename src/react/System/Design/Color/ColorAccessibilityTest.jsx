import React from 'react'
import PropTypes from 'prop-types'
import contrast from 'get-contrast'
import Icon from '@Design/Icon/Icon'

import './ColorAccessibilityTest.scss'

const ColorAccessibilityTest = props =>
  <div className="sys-color-accessibility-test flex-row">
    <div className="sys-color-accessibility-test__result flex-row">
      {contrast.isAccessible(props.color, props.base) &&
        <Icon name="statusSuccess" className="color-status-success"/>
      }
      <div>{contrast.score(props.color, props.base)}</div>
      <div>{contrast.ratio(props.color, props.base).toFixed(2)}</div>
    </div>
    <div className="sys-color-accessibility-test__example" style={{ color: props.color }}>
      Aa
    </div>
  </div>

ColorAccessibilityTest.propTypes = {
  base: PropTypes.string,
  color: PropTypes.string,
}

ColorAccessibilityTest.defaultProps = {
  base: '#ffffff',
  color: '#000000',
}

export default ColorAccessibilityTest
