import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './Icon.scss'

import mggIconsDictionary from '+Project/mgg-icons/src/mgg-icons.json'
const dictionary = Object.keys(mggIconsDictionary)

const Icon = ({ name, onClick, size, ...restProps }) => {
  let icon = 'mgg-icons-status-warning'
  let notFound = true
  if (dictionary.includes(name)) {
    icon = `mgg-icons-${name}`
    notFound = false
  }

  const classes = styles('icon', {
    selectors: [
      restProps.className,
      icon,
    ],
    modifiers: {
      size,
    },
  })

  return <i onClick={onClick} className={classes} title={notFound ? `Warning, icon "${name}" not found` : ''}></i>
}

Icon.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.string,
}

Icon.defaultProps = {
  name: 'missingIcon',
  size: 'normal',
}

export default Icon
