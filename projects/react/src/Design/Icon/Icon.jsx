import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './Icon.scss'

import mggIconsDictionary from '+Project/mgg-icons/resources/mgg-icons.json'
const dictionary = Object.keys(mggIconsDictionary)

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

  let icon = 'mgg-icons-status-warning'
  let notFound = true
  if (dictionary.includes(name)) {
    icon = `mgg-icons-${name}`
    notFound = false
  }

  const classes = styles('icon', {
    selectors: [
      className,
      icon,
    ],
    modifiers: {
      size,
    },
  })

  return <i {...restProps} onClick={onClick} className={classes} title={notFound ? `Warning: icon <${name}> not found` : ''}></i>
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
