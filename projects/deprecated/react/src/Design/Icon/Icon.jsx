import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './Icon.scss'

const Icon = ({ className, image, name, onClick, size, ...restProps }) => {
  if (image) {
    const classes = styles('icon', {
      selectors: [
        className,
      ],
      modifiers: {
        size,
      },
    })
    return <div onClick={onClick} className={`${classes} icon--image`} style={{ backgroundImage: `url("${image}")` }}></div>
  }

  const icon = !image ? 'mgg-icons-' + name : ''

  const classes = styles('icon', {
    selectors: [
      className,
      icon,
    ],
    modifiers: {
      size,
    },
  })

  return <i {...restProps} onClick={onClick} className={classes}></i>
}

Icon.propTypes = {
  className: PropTypes.string,
  image: PropTypes.string,
  name: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.string,
}

Icon.defaultProps = {
  name: 'status-warning',
  size: 'normal',
}

export default Icon
