import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Typography from '@Typography/Typography'

const Caption = ({ children, className, htmlTag, ...restProps }) => {
  const classes = styles('caption', {
    selectors: [
      className,
      'text-secondary text-secondary--caption',
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

Caption.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Caption.defaultProps = {
  htmlTag: 'p',
}

export default Caption
