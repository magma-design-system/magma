import React from 'react'
import PropTypes from 'prop-types'
import './Select.scss'

import Icon from '@Design/Icon/Icon'

const SelectOption = props =>
  <option className={`select__option ${props.className}`}>
    { props.children }
  </option>

SelectOption.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string,
}

SelectOption.defaultProps = {
  className: '',
  value: '0',
}

const Select = props =>
  <div className={`select ${props.className}`}>
    { props.label &&
      <div className="select__label text-primary text-primary--h6">
        {props.label}
      </div>
    }
    <div className="select__item">
      <select className="select__field text-secondary text-secondary--paragraph" name={props.name}>
        { props.children }
      </select>
      <Icon className="select__icon" name="formSelectOption"/>
    </div>
  </div>

Select.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
}

Select.defaultProps = {
  className: '',
  icon: '',
  label: '',
  name: 'unassigned',
}

export default Select
export {
  SelectOption,
}
