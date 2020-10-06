import React from 'react'
import PropTypes from 'prop-types'
import './Input.scss'
import Input from './Input'

const InputEmail = props =>
  <Input {...props}>
    <input
      autoComplete={props.autoComplete}
      className="backoffice-input__field text-sans text-sans--input"
      defaultValue={props.value}
      name={props.name}
      onChange={props.onChange}
      placeholder={props.placeholder}
      type="email"
    />
  </Input>

InputEmail.propTypes = {
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

InputEmail.defaultProps = {
  autoComplete: 'off',
  icon: 'email',
  iconClassName: '',
  name: 'email',
  onChange: () => {},
  placeholder: 'your@email.com',
  isValid: false,
  validate: true,
  value: '',
}

export default InputEmail
