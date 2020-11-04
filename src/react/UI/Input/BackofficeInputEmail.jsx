import React from 'react'
import PropTypes from 'prop-types'
import './Input.scss'
import BackofficeInput from './BackofficeInput'

const BackofficeInputEmail = props =>
  <BackofficeInput {...props}>
    <input
      autoComplete={props.autoComplete}
      className="backoffice-input__field text-secondary text-secondary--detail"
      defaultValue={props.value}
      name={props.name}
      onChange={props.onChange}
      placeholder={props.placeholder}
      type="email"
    />
  </BackofficeInput>

BackofficeInputEmail.propTypes = {
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

BackofficeInputEmail.defaultProps = {
  autoComplete: 'off',
  icon: 'document-email',
  iconClassName: '',
  name: 'email',
  onChange: () => {},
  placeholder: 'your@email.com',
  isValid: false,
  validate: true,
  value: '',
}

export default BackofficeInputEmail
