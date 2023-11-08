import React from 'react'
import PropTypes from 'prop-types'
import Input from '@UI/Input/Input'
import { capitalize } from '@UI/Select/functions'

const InputPhone = ({ autoComplete, autoFocus, font, name, onChange, pattern, placeholder, value, ...restProps }) =>
  <Input {...restProps}>
    <input
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      className={`input__field ${font}`}
      defaultValue={value}
      name={name}
      onChange={onChange}
      placeholder={capitalize(placeholder)}
      pattern={pattern}
      type="tel"
    />
  </Input>

InputPhone.propTypes = {
  ...Input.propTypes,
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  font: PropTypes.string,
  isValid: PropTypes.bool,
  name: PropTypes.string,
  pattern: PropTypes.string,
  placeholder: PropTypes.string,
  validate: PropTypes.bool,
  value: PropTypes.string,
}

InputPhone.defaultProps = {
  autoComplete: 'off',
  font: 'text-secondary text-secondary--detail',
  icon: 'touchpoint-smartphone',
  iconClassName: '',
  isValid: false,
  name: 'phone',
  pattern: '[+0-9.]+',
  placeholder: '+39 123 4567890',
  validate: true,
  value: '',
}

export default InputPhone
