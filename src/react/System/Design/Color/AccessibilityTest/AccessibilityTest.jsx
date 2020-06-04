import React from 'react'
import PropTypes from 'prop-types'
import contrast from 'get-contrast'
import Icon from '@Design/Icon/Icon'
import Caption from '@Typography/Caption/Caption'

const AccessibilityTest = props =>
  <Caption className="mds-accessibility-test flex-row">
    <div className="mds-color-accessibility-test__result flex-row">
      {contrast.isAccessible(props.color, props.base) &&
        <Icon name="statusSuccess" className="color-status-success" size="small"/>
      }
      <div>{contrast.score(props.color, props.base)}</div>
      <div>{contrast.ratio(props.color, props.base).toFixed(2)}</div>
    </div>
  </Caption>

AccessibilityTest.propTypes = {
  base: PropTypes.string,
  color: PropTypes.string,
}

AccessibilityTest.defaultProps = {
  base: '#ffffff',
  color: '#000000',
}

export default AccessibilityTest
