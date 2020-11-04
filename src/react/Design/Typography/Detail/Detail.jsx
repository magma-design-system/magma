import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@Typography/Typography'

const Detail = props =>
  <Typography
    className={`text-secondary text-secondary--detail ${props.className}`}
    htmlTag={props.htmlTag}
  >
    {props.children}
  </Typography>

Detail.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Detail.defaultProps = {
  className: '',
  htmlTag: 'p',
}

export default Detail
