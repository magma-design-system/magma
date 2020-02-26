import React from 'react'
import PropTypes from 'prop-types'
import './Filter.scss'

import Filter from './Filter'
import Checkbox from '../Form/Checkbox/Checkbox'

const FilterTag = props =>
  <Filter {...props}>
    <Checkbox name="palette" paletteColor={'red2'} icon="tag" value={1} onChange={true}>
      B&B La Luna Rossa
    </Checkbox>
    <Checkbox name="palette" paletteColor={'red2'} icon="tag" value={1} onChange={true}>
      B&B Da Mario
    </Checkbox>
    <Checkbox name="palette" paletteColor={'blue1'} icon="tag" value={2} onChange={true}>
      Usate
    </Checkbox>
    <Checkbox name="palette" paletteColor={'yellow2'} icon="tag" value={3} onChange={true}>
      Whishlist
    </Checkbox>
    <Checkbox name="palette" paletteColor={'purple1'} icon="tag" value={3} onChange={true}>
      In manutenzione
    </Checkbox>
  </Filter>

FilterTag.propTypes = {
  className: PropTypes.string,
  isActive: PropTypes.bool,
  onActivation: PropTypes.func,
  title: PropTypes.string,
}

FilterTag.defaultProps = {
  className: '',
  isActive: false,
  onActivation: () => {},
  title: 'Tags',
}

export default FilterTag
