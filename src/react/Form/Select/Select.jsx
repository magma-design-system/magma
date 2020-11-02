import React from 'react'
import PropTypes from 'prop-types'
import './Select.scss'

import Icon from '@Design/Icon/Icon'

const SelectOption = props =>
  <option className={`select__option ${props.className}`} value={props.value}>
    { props.children } &emsp;&ensp;
  </option>

SelectOption.propTypes = {
  className: PropTypes.string,
  value: PropTypes.any,
}

SelectOption.defaultProps = {
  className: '',
}

const Select = props =>
  <div className={`select ${props.className}`}>
    { props.label &&
      <div className="select__label text-primary text-primary--h6">
        { props.label }
      </div>
    }
    <div className="select__item">
      <select onChange={props.onChange} className={`select__field ${props.font}`} name={props.name} value={props.value}>
        { props.children }
      </select>
      <Icon className="select__icon" name={props.icon}/>
    </div>
  </div>

Select.propTypes = {
  className: PropTypes.string,
  font: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
}

Select.defaultProps = {
  className: '',
  font: 'text-secondary text-secondary--detail',
  icon: 'navigation-show',
  label: '',
  name: 'unassigned',
  onChange: e => { return e.target.value },
  value: '',
}

export default Select
export {
  SelectOption,
}
