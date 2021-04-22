import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Typography from '@Typography/Typography'

const H4 = ({ children, className, htmlTag, ...restProps }) => {
  const classes = styles('h4', {
    selectors: [
      className,
      'text-primary text-primary--h4',
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

H4.propTypes = {
  ...Typography.propTypes,
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

H4.defaultProps = {
  htmlTag: 'h4',
}

export default H4
