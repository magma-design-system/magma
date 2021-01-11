import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Typography from '@Typography/Typography'

const H3 = ({ className, htmlTag, ...restProps }) => {
  const classes = styles('h3', {
    selectors: [
      className,
      'text-primary text-primary--h3',
    ],
  })
  return <Typography
    className={classes}
    htmlTag={htmlTag}
  >
    {restProps.children}
  </Typography>
}

H3.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

H3.defaultProps = {
  htmlTag: 'h3',
}

export default H3
