import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@Typography/Typography'

const H2 = props =>
  <Typography
    className={`text-primary text-primary--h2 ${props.className}`}
    htmlTag={props.htmlTag}
  >
    {props.children}
  </Typography>

H2.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

H2.defaultProps = {
  className: '',
  htmlTag: 'h2',
}

export default H2
