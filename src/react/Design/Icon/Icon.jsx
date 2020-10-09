import React from 'react'
import PropTypes from 'prop-types'
import './Icon.scss'

import mggIconsDictionary from '£Project/mgg-icons/src/mgg-icons.json'
const dictionary = Object.keys(mggIconsDictionary)

const Icon = props => {
  let icon = 'mgg-icons-status-warning'
  let notFound = true
  if (dictionary.includes(props.name)) {
    icon = `mgg-icons-${props.name}`
    notFound = false
  }
  return <i title={notFound ? `Warning, icon "${icon}" not found` : ''} className={`mgg-icons ${icon} icon ${(props.size ? 'icon--' + props.size : '')} ${props.className}`}></i>
}

Icon.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string,
  family: PropTypes.string,
  size: PropTypes.string,
}

Icon.defaultProps = {
  className: '',
  name: 'missingIcon',
  family: 'material',
  size: '',
}

export default Icon
