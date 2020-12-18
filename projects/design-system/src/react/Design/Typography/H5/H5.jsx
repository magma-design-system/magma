import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Typography from '@Typography/Typography'

const H5 = ({ htmlTag, ...restProps }) => {
  const classes = styles('h5', {
    selectors: [
      restProps.className,
      'text-primary text-primary--h5',
    ],
  })
  return <Typography
    className={classes}
    htmlTag={htmlTag}
  >
    {restProps.children}
  </Typography>
}

H5.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

H5.defaultProps = {
  htmlTag: 'h5',
}

export default H5
