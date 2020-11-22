import React from 'react'
import PropTypes from 'prop-types'
import { appendSelectors, modifiers } from '@Library/styles'
import './Icon.scss'

import mggIconsDictionary from '+Project/mgg-icons/src/mgg-icons.json'
const dictionary = Object.keys(mggIconsDictionary)

const Icon = ({ name, onClick, size, ...restProps }) => {
  const mainSelector = 'icon'
  const localClassNames = appendSelectors([
    mainSelector,
    restProps.className,
  ])

  const modifierClassNames = modifiers(mainSelector, {
    size,
  })

  let icon = 'mgg-icons-status-warning'
  let notFound = true
  if (dictionary.includes(name)) {
    icon = `mgg-icons-${name}`
    notFound = false
  }
  return <i onClick={onClick} className={`mgg-icons ${icon} ${localClassNames} ${modifierClassNames}`} title={notFound ? `Warning, icon "${name}" not found` : ''}></i>
}

Icon.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.string,
}

Icon.defaultProps = {
  name: 'missingIcon',
}

export default Icon
