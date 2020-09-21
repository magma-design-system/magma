import React from 'react'
import PropTypes from 'prop-types'
import Typography from '../Typography'

const LabelCaption = props =>
  <Typography
    className={`text-secondary text-secondary--label-caption ${props.className}`}
    htmlTag={props.htmlTag}
  >
    {props.children}
  </Typography>

LabelCaption.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

LabelCaption.defaultProps = {
  className: '',
  htmlTag: 'p',
}

export default LabelCaption
