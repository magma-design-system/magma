import React from 'react'
import PropTypes from 'prop-types'
import './Input.scss'
import Input from './Input'

const InputText = props =>
  <Input {...props}>
    <input
      autoComplete={props.autoComplete}
      className={`input__field ${props.font}`}
      defaultValue={props.value}
      name={props.name}
      onChange={props.onChange}
      placeholder={props.placeholder}
      type="text"
    />
  </Input>

InputText.propTypes = {
  autoComplete: PropTypes.string,
  icon: PropTypes.string,
  font: PropTypes.string,
  iconClassName: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.string,
}

InputText.defaultProps = {
  autoComplete: 'off',
  icon: '',
  font: 'text-secondary text-secondary--detail',
  iconClassName: '',
  name: 'unassigned',
  onChange: value => { return value },
  placeholder: '',
  value: '',
}

export default InputText
