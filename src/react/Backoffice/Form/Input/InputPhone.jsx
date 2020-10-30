import React from 'react'
import PropTypes from 'prop-types'
import './Input.scss'
import Input from './Input'

const InputPassword = props =>
  <Input {...props}>
    <input
      autoComplete={props.autoComplete}
      className="backoffice-input__field text-secondary text-secondary--detail"
      defaultValue={props.value}
      name={props.name}
      onChange={props.onChange}
      placeholder={props.placeholder}
      type="password"
    />
  </Input>

InputPassword.propTypes = {
  autoComplete: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  isValid: PropTypes.bool,
  validate: PropTypes.bool,
  value: PropTypes.string,
}

InputPassword.defaultProps = {
  autoComplete: 'off',
  icon: 'touchpoint-smartphone',
  iconClassName: '',
  name: 'password',
  onChange: () => {},
  placeholder: '',
  isValid: false,
  validate: true,
  value: '',
}

export default InputPassword
