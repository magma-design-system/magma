import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Typography from '@Typography/Typography'

const Code = ({ children, className, htmlTag, ...restProps }) => {
  const classes = styles('code', {
    selectors: [
      className,
      'text-mono text-mono--code',
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

Code.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Code.defaultProps = {
  htmlTag: 'code',
}

export default Code
