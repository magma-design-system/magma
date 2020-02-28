import React from 'react'
import PropTypes from 'prop-types'
import Typography from '../Typography'

const Caption = props =>
  <Typography
    className={`text-sans--caption ${props.className}`}
    htmlTag={props.htmlTag}
  >
    {props.children}
  </Typography>

Caption.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Caption.defaultProps = {
  className: '',
  htmlTag: 'p',
}

export default Caption
