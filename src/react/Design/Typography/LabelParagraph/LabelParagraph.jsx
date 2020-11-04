import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@Typography/Typography'

const LabelParagraph = props =>
  <Typography
    className={`text-secondary text-secondary--label-paragraph ${props.className}`}
    htmlTag={props.htmlTag}
  >
    {props.children}
  </Typography>

LabelParagraph.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

LabelParagraph.defaultProps = {
  className: '',
  htmlTag: 'p',
}

export default LabelParagraph
