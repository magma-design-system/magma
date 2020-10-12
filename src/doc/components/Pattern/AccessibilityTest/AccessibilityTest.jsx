import React from 'react'
import PropTypes from 'prop-types'
import contrast from 'get-contrast'
import Icon from '@Design/Icon/Icon'
import Row from '@Layout/Row/Row'

import './AccessibilityTest.scss'

const AccessibilityTest = props =>
  <Row className="mds-accessibility-test">
    <div className="mds-accessibility-test__result">
      {contrast.score(props.color, props.base) === 'AAA'
        ? <b className="mds-accessibility-test__vote mds-accessibility-test__vote--best">{contrast.score(props.color, props.base)}</b>
        : <div className="mds-accessibility-test__vote">
          {!contrast.isAccessible(props.color, props.base)
            ? <div className="mds-accessibility-test__detail"><Icon className="mds-accessibility-test__icon" name="status-warning" size="small"/> <span>{contrast.score(props.color, props.base)}</span></div>
            : <div className="mds-accessibility-test__detail">{contrast.score(props.color, props.base)}</div>
          }
        </div>
      }
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
