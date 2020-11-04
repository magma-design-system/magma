import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@Typography/Typography'

const Paragraph = props =>
  <Typography
    className={`text-secondary text-secondary--paragraph ${props.className}`}
    htmlTag={props.htmlTag}
  >
    {props.children}
  </Typography>

Paragraph.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Paragraph.defaultProps = {
  className: '',
  htmlTag: 'p',
}

export default Paragraph
