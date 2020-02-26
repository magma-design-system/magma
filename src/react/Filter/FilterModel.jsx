import React from 'react'
import PropTypes from 'prop-types'
import './Filter.scss'

import Filter from './Filter'
import Checkbox from '../Form/Checkbox/Checkbox'

const FilterModel = props =>
  <Filter {...props}>
    <Checkbox name="model" icon="car" isChecked={true} value={true} onChange={true}>
      BMW
    </Checkbox>
    <Checkbox name="model" icon="car" value={false} onChange={false}>
      Mercedes
    </Checkbox>
    <Checkbox name="model" icon="car" value={false} onChange={false}>
      FIAT
    </Checkbox>
  </Filter>

FilterModel.propTypes = {
  className: PropTypes.string,
  isActive: PropTypes.bool,
  onActivation: PropTypes.func,
  title: PropTypes.string,
}

FilterModel.defaultProps = {
  className: '',
  isActive: false,
  onActivation: () => {},
  title: 'Model',
}

export default FilterModel
