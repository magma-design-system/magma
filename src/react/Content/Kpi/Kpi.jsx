// Key Performance Indicators

import React from 'react'
import PropTypes from 'prop-types'
import './Kpi.scss'

const Kpi = props =>
  <div className={`kpi ${props.className}`}>
    {props.children}
  </div>

Kpi.propTypes = {
  className: PropTypes.string,
}

Kpi.defaultProps = {
  className: '',
}

export default Kpi
