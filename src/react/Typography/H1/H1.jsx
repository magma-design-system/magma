import React from 'react'
import PropTypes from 'prop-types'
import Typography from '../Typography'

const H1 = props =>
  <Typography
    className={`text-sans--h1 ${props.className}`}
    htmlTag={props.htmlTag}
  >
    {props.children}
  </Typography>

H1.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

H1.defaultProps = {
  className: '',
  htmlTag: 'h1',
}

export default H1
