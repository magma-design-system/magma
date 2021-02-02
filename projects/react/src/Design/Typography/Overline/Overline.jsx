import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Typography from '@Typography/Typography'

const Overline = ({ className, htmlTag, ...restProps }) => {
  const classes = styles('overline', {
    selectors: [
      className,
      'text-primary text-primary--overline',
    ],
  })
  return <Typography
    className={classes}
    htmlTag={htmlTag}
  >
    {restProps.children}
  </Typography>
}

Overline.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Overline.defaultProps = {
  htmlTag: 'p',
}

export default Overline
