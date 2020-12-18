import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Typography from '@Typography/Typography'

const H6 = ({ htmlTag, ...restProps }) => {
  const classes = styles('h6', {
    selectors: [
      restProps.className,
      'text-primary text-primary--h6',
    ],
  })
  return <Typography
    className={classes}
    htmlTag={htmlTag}
  >
    {restProps.children}
  </Typography>
}

H6.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

H6.defaultProps = {
  htmlTag: 'h6',
}

export default H6
