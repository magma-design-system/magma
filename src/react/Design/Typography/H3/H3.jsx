import React from 'react'
import PropTypes from 'prop-types'
import Typography from '../Typography'

const H3 = props =>
  <Typography
    className={`text-primary text-primary--h3 ${props.className}`}
    htmlTag={props.htmlTag}
  >
    {props.children}
  </Typography>

H3.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

H3.defaultProps = {
  className: '',
  htmlTag: 'h3',
}

export default H3
