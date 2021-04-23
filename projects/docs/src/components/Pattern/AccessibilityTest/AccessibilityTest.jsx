import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import contrast from 'get-contrast'
import Icon from '@Design/Icon/Icon'

import './AccessibilityTest.scss'

const AccessibilityTest = props =>
  <Fragment>
    <div>
      {contrast.score(props.color, props.base) === 'AAA'
        ? <div className="inline-flex rounded-full bg-status-success-18 text-status-success-04 px-4 py-1">
          <Icon className="text-status-success-08 mr-1" name="status-success" size="small"/>
          <b>{contrast.score(props.color, props.base)}</b>
        </div>
        : <Fragment>
          {!contrast.isAccessible(props.color, props.base)
            ? <div className="inline-flex rounded-full bg-status-error-18 text-status-error-04 px-4 py-1">
              <Icon className="text-status-error-08 mr-1" name="status-warning" size="small"/>
              <b>{contrast.score(props.color, props.base)}</b>
            </div>
            : <b className="inline-flex rounded-full px-4 py-1">{contrast.score(props.color, props.base)}</b>
          }
        </Fragment>
      }
    </div>
    <div>{contrast.ratio(props.color, props.base).toFixed(2)}</div>
  </Fragment>

AccessibilityTest.propTypes = {
  base: PropTypes.string,
  color: PropTypes.string,
}

AccessibilityTest.defaultProps = {
  base: '#ffffff',
  color: '#000000',
}

export default AccessibilityTest
