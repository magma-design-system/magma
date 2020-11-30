import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@Typography/Typography'

const H5 = props =>
  <Typography
    className={`text-primary text-primary--h5 ${props.className}`}
    htmlTag={props.htmlTag}
  >
    {props.children}
  </Typography>

H5.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

H5.defaultProps = {
  className: '',
  htmlTag: 'h5',
}

export default H5
