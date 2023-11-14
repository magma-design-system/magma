import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Typography from '@Typography/Typography'

const Hack = ({ children, className, htmlTag, ...restProps }) => {
  const classes = styles('hack', {
    selectors: [
      className,
      'text-mono text-mono--hack',
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

Hack.propTypes = {
  ...Typography.propTypes,
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Hack.defaultProps = {
  htmlTag: 'code',
}

export default Hack
