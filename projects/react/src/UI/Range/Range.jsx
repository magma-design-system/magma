import React from 'react'
import PropTypes from 'prop-types'
import './Range.scss'

const Range = props =>
  <input className={`range ${props.className}`} type="range"/>

Range.propTypes = {
  className: PropTypes.string,
}

Range.defaultProps = {
  className: '',
}

export default Range
