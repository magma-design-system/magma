import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Typography from '@Typography/Typography'

const LabelCaption = ({ className, htmlTag, ...restProps }) => {
  const classes = styles('label-caption', {
    selectors: [
      className,
      'text-secondary text-secondary--label-caption',
    ],
  })
  return <Typography
    className={classes}
    htmlTag={htmlTag}
  >
    {restProps.children}
  </Typography>
}

LabelCaption.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

LabelCaption.defaultProps = {
  htmlTag: 'p',
}

export default LabelCaption
