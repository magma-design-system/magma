import React from 'react'
import PropTypes from 'prop-types'
import contrast from 'get-contrast'
import Icon from '@Design/Icon/Icon'
import Row from '@Layout/Row/Row'

const AccessibilityTest = props =>
  <Row className="mds-accessibility-test">
    <div className="mds-color-accessibility-test__result flex-row">
      {contrast.isAccessible(props.color, props.base) &&
        <Icon name="statusSuccess" size="small"/>
      }
      <div>{contrast.score(props.color, props.base)}</div>
      <div>{contrast.ratio(props.color, props.base).toFixed(2)}</div>
    </div>
  </Row>

AccessibilityTest.propTypes = {
  base: PropTypes.string,
  color: PropTypes.string,
}

AccessibilityTest.defaultProps = {
  base: '#ffffff',
  color: '#000000',
}

export default AccessibilityTest
