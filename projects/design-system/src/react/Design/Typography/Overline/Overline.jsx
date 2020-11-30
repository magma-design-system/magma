import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@Typography/Typography'

const Overline = props =>
  <Typography
    className={`text-primary text-primary--overline ${props.className}`}
    htmlTag={props.htmlTag}
  >
    {props.children}
  </Typography>

Overline.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Overline.defaultProps = {
  className: '',
  htmlTag: 'p',
}

export default Overline
