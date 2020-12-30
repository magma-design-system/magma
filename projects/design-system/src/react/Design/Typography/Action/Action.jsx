import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Typography from '@Typography/Typography'

const Action = ({ htmlTag, ...restProps }) => {
  const classes = styles('action', {
    selectors: [
      restProps.className,
      'text-primary text-primary--action',
    ],
  })
  return <Typography
    className={classes}
    htmlTag={htmlTag}
  >
    {restProps.children}
  </Typography>
}

Action.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Action.defaultProps = {
  htmlTag: 'span',
}

export default Action
