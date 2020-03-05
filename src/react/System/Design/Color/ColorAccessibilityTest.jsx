import React from 'react'
import PropTypes from 'prop-types'
import contrast from 'get-contrast'
import Icon from '@Design/Icon/Icon'

function checkRatio(ratio) {
  if (ratio < 3) {
    return <Icon name="error" className="color-status-error"/>
  }

  if (ratio < 4) {
    return <Icon name="warning" className="color-status-warning"/>
  }

  return null
}

const ColorAccessibilityTest = props =>
  <div class="sys-color-accessibility-test flex-row">
    <div>{contrast.score(props.color, props.base)}</div>
    <div>{contrast.ratio(props.color, props.base).toFixed(2)}</div>
    {!contrast.isAccessible(props.color, props.base) &&
      checkRatio(contrast.ratio(props.color, props.base))
    }
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
