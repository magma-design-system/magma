import React from 'react'
import PropTypes from 'prop-types'
import './BackofficeInput.scss'
import BackofficeInput from './Input'

const BackofficeInputPassword = props =>
  <BackofficeInput {...props}>
    <input
      autoComplete={props.autoComplete}
      className="backoffice-input__field text-secondary text-secondary--detail"
      defaultValue={props.value}
      name={props.name}
      onChange={props.onChange}
      placeholder={props.placeholder}
      type="password"
    />
  </BackofficeInput>

BackofficeInputPassword.propTypes = {
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

BackofficeInputPassword.defaultProps = {
  autoComplete: 'off',
  icon: 'security-password',
  iconClassName: '',
  name: 'password',
  onChange: () => {},
  placeholder: '',
  isValid: false,
  validate: true,
  value: '',
}

export default BackofficeInputPassword
