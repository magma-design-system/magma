import React from 'react'
import PropTypes from 'prop-types'
import './Filter.scss'

import Filter from './Filter'
import Radio from '../Form/Radio/Radio'

const FilterConnection = props =>
  <Filter {...props}>
    <Radio name="connected" icon="connectedYes" isChecked={true} value={true} onChange={true}>
      Connected
    </Radio>
    <Radio name="connected" icon="connectedNo" value={false} onChange={false}>
      Disconnected
    </Radio>
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
  title: 'Connection',
}

export default FilterConnection
