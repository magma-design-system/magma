import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Typography from '@Typography/Typography'

const Detail = ({ children, className, htmlTag, ...restProps }) => {
  const classes = styles('detail', {
    selectors: [
      className,
      'text-secondary text-secondary--detail',
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

Detail.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Detail.defaultProps = {
  htmlTag: 'p',
}

export default Detail
