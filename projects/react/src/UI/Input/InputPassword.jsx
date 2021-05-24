import React from 'react'
import PropTypes from 'prop-types'
import './Input.scss'
import Input from '@UI/Input/Input'
import { capitalize } from '@UI/Select/functions'

const InputPassword = ({ autoComplete, autoFocus, font, name, onChange, placeholder, value, ...restProps }) => {
  return <Input {...restProps}>
    <input
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      className={`input__field ${font}`}
      defaultValue={value}
      name={name}
      onChange={onChange}
      placeholder={capitalize(placeholder)}
      type="password"
    />
  </Input>
}

InputPassword.propTypes = {
  ...Input.propTypes,
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  font: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.string,
}

InputPassword.defaultProps = {
  autoComplete: 'off',
  font: 'text-secondary text-secondary--detail',
  icon: 'security-password',
  iconClassName: '',
  name: 'unassigned',
  onChange: value => { return value },
  placeholder: 'Inserisci almeno 8 caratteri',
  value: '',
}

export default InputPassword
