import React from 'react'
import PropTypes from 'prop-types'
import './Icon.scss'

import dictionary from './dictionary.json'

// todo: https://www.meziantou.net/creating-a-fontawesome-bundle-with-only-the-icons-you-use.htm
// todo: https://vuetifyjs.com/en/customization/icons/
// todo: https://stackoverflow.com/questions/57552261/vuetifyjs-adding-only-used-icons-to-build#answer-57552882

const Icon = props =>
  <i title={dictionary[props.name][props.family] ? '' : 'Warning: property "name" not set'} className={`material-icons icon ${(props.size ? 'icon--' + props.size : '')} ${props.className}`}>{(dictionary[props.name][props.family] ? dictionary[props.name][props.family] : dictionary.missingIcon[props.family])}</i>

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
