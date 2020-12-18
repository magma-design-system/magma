import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Typography from '@Typography/Typography'

const H2 = ({ htmlTag, ...restProps }) => {
  const classes = styles('h2', {
    selectors: [
      restProps.className,
      'text-primary text-primary--h2',
    ],
  })
  return <Typography
    className={classes}
    htmlTag={htmlTag}
  >
    {restProps.children}
  </Typography>
}

H2.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

H2.defaultProps = {
  htmlTag: 'h2',
}

export default H2
