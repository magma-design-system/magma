import React from 'react'
import PropTypes from 'prop-types'
import './Select.scss'

import Icon from '@Design/Icon/Icon'

const SelectOption = props =>
  <option className={`select__option ${props.className}`} value={props.value}>
    { props.children }
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
      <select onChange={props.onChange} className="select__field text-secondary text-secondary--paragraph" name={props.name} value={props.value}>
        { props.children }
      </select>
      <Icon className="select__icon" name={props.icon}/>
    </div>
  </div>

Select.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
}

Select.defaultProps = {
  className: '',
  icon: 'formSelectOption',
  label: '',
  name: 'unassigned',
  onChange: e => { return e.target.value },
  value: '',
}

export default Select
export {
  SelectOption,
}
