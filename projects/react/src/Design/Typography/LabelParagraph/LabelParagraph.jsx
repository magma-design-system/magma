import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Typography from '@Typography/Typography'

const LabelParagraph = ({ children, className, htmlTag, ...restProps }) => {
  const classes = styles('label-paragraph', {
    selectors: [
      className,
      'text-secondary text-secondary--label-paragraph',
    ],
  })
  return <Typography
    className={classes}
    htmlTag={htmlTag}
    {...restProps}
  >
    {children}
  </Typography>
}

LabelParagraph.propTypes = {
  ...Typography.propTypes,
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

LabelParagraph.defaultProps = {
  htmlTag: 'p',
}

export default LabelParagraph
