import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Typography from '@Typography/Typography'

const Paragraph = ({ htmlTag, ...restProps }) => {
  const classes = styles('paragraph', {
    selectors: [
      restProps.className,
      'text-secondary text-secondary--paragraph',
    ],
  })
  return <Typography
    className={classes}
    htmlTag={htmlTag}
  >
    {restProps.children}
  </Typography>
}

Paragraph.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Paragraph.defaultProps = {
  htmlTag: 'p',
}

export default Paragraph
