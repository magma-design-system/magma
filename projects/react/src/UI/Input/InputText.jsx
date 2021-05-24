import React from 'react'
import PropTypes from 'prop-types'
import './Input.scss'
import Input from '@UI/Input/Input'
import { capitalize } from '@UI/Select/functions'

const InputText = ({ autoComplete, autoFocus, font, name, onChange, placeholder, value, ...restProps }) =>
  <Input {...restProps}>
    <input
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      className={`input__field ${font}`}
      defaultValue={value}
      name={name}
      onChange={onChange}
      placeholder={capitalize(placeholder)}
      type="text"
    />
  </Input>

InputText.propTypes = {
  ...Input.propTypes,
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  font: PropTypes.string,
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
