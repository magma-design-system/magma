import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Typography from '@Typography/Typography'

const LabelDetail = ({ htmlTag, ...restProps }) => {
  const classes = styles('label-detail', {
    selectors: [
      restProps.className,
      'text-secondary text-secondary--label-detail',
    ],
  })
  return <Typography
    className={classes}
    htmlTag={htmlTag}
  >
    {restProps.children}
  </Typography>
}

LabelDetail.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

LabelDetail.defaultProps = {
  htmlTag: 'p',
}

export default LabelDetail
