import React from 'react'
import PropTypes from 'prop-types'
import Typography from '../Typography'

const H6 = props =>
  <Typography
    className={`text-sans--h6 ${props.className}`}
    htmlTag={props.htmlTag}
  >
    {props.children}
  </Typography>

H6.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

H6.defaultProps = {
  className: '',
  htmlTag: 'h6',
}

export default H6
