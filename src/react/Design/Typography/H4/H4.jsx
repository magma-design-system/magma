import React from 'react'
import PropTypes from 'prop-types'
import Typography from '../Typography'

const H4 = props =>
  <Typography
    className={`text-sans--h4 ${props.className}`}
    htmlTag={props.htmlTag}
  >
    {props.children}
  </Typography>

H4.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

H4.defaultProps = {
  className: '',
  htmlTag: 'h4',
}

export default H4
