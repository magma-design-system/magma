import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { capitalize } from '@UI/Select/functions'
import './Select.scss'
import Icon from '@Design/Icon/Icon'

const SelectOption = props =>
  <option className={`select__option ${props.className}`} value={props.value}>
    { capitalize(props.children) }
  </option>

SelectOption.propTypes = {
  className: PropTypes.string,
  value: PropTypes.any,
}

SelectOption.defaultProps = {
  className: '',
}

const OptionsData = props => {
  return props.data.map((value, key) => <SelectOption key={key} value={value}>{value}</SelectOption>)
}

OptionsData.propTypes = {
  data: PropTypes.any,
  value: PropTypes.string,
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
        {!props.data
          ? <Fragment>{ props.children }</Fragment>
          : <OptionsData data={props.data} value={props.value}/>
        }
      </select>
      <Icon className="select__icon" name={props.icon}/>
    </div>
  </div>

Select.propTypes = {
  className: PropTypes.string,
  data: PropTypes.any,
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
