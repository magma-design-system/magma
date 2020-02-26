import React from 'react'
import PropTypes from 'prop-types'
import './Icon.scss'

import dictionary from './dictionary.json'

const Icon = props =>
  <i onClick={() => { props.onClick() }} title={dictionary[props.name] ? '' : 'Warning: property "name" not set'} className={`material-icons icon ${(props.size ? 'icon--' + props.size : '')} ${props.className}`}>{(dictionary[props.name] ? dictionary[props.name] : dictionary.missingIcon)}</i>

Icon.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.string,
}

Icon.defaultProps = {
  className: '',
  name: 'missingIcon',
  size: '',
}

export default Icon
