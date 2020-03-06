import React from 'react'
import PropTypes from 'prop-types'
import contrast from 'get-contrast'
import Icon from '@Design/Icon/Icon'

import './VerticalAccessibilityTest.scss'

const VerticalAccessibilityTest = props =>
  <div className="sys-vertical-accessibility-test flex-row">
    <div className="sys-vertical-accessibility-test__result flex-row">
      {contrast.isAccessible(props.color, props.base) &&
        <Icon name="success" className="color-status-success"/>
      }
      <div>{contrast.score(props.color, props.base)}</div>
      <div>{contrast.ratio(props.color, props.base).toFixed(2)}</div>
    </div>
    <div className="sys-vertical-accessibility-test__example" style={{ color: props.color }}>
      Aa
    </div>
  </div>

VerticalAccessibilityTest.propTypes = {
  base: PropTypes.string,
  color: PropTypes.string,
}

VerticalAccessibilityTest.defaultProps = {
  base: '#ffffff',
  color: '#000000',
}

export default VerticalAccessibilityTest
