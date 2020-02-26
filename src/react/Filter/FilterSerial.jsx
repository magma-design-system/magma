import React from 'react'
import PropTypes from 'prop-types'
import './Filter.scss'

import Filter from './Filter'
import InputSerial from '../Form/Input/InputSerial'

const FilterConnection = props =>
  <Filter {...props}>
    <InputSerial className="filter__item"/>
  </Filter>

FilterConnection.propTypes = {
  className: PropTypes.string,
  isActive: PropTypes.bool,
  onActivation: PropTypes.func,
  title: PropTypes.string,
}

FilterConnection.defaultProps = {
  className: '',
  isActive: false,
  onActivation: () => {},
  title: 'Serial',
}

export default FilterConnection
