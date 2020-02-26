import React from 'react'
import PropTypes from 'prop-types'
import './Filter.scss'

import Filter from './Filter'
import Radio from '../Form/Radio/Radio'

const FilterInstallation = props =>
  <Filter {...props}>
    <Radio name="installed" icon="installedYes" isChecked={true} value={true} onChange={true}>
      Installed
    </Radio>
    <Radio name="installed" icon="installedNo" value={false} onChange={false}>
      Not installed
    </Radio>
  </Filter>

FilterInstallation.propTypes = {
  className: PropTypes.string,
  isActive: PropTypes.bool,
  onActivation: PropTypes.func,
  title: PropTypes.string,
}

FilterInstallation.defaultProps = {
  className: '',
  isActive: false,
  onActivation: () => {},
  title: 'Installation',
}

export default FilterInstallation
