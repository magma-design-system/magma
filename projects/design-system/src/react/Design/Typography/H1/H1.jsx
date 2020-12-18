import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Typography from '@Typography/Typography'

const H1 = ({ htmlTag, ...restProps }) => {
  const classes = styles('h1', {
    selectors: [
      restProps.className,
      'text-primary text-primary--h1',
    ],
  })
  return <Typography
    className={classes}
    htmlTag={htmlTag}
  >
    {restProps.children}
  </Typography>
}

H1.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

H1.defaultProps = {
  htmlTag: 'h1',
}

export default H1
