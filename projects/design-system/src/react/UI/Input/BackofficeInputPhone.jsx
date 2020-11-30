import React from 'react'
import PropTypes from 'prop-types'
import './BackofficeInput.scss'
import BackofficeInput from '@UI/Input/BackofficeInput'
import { capitalize } from '@UI/Select/functions'

const BackofficeInputPhone = props =>
  <BackofficeInput {...props}>
    <input
      autoComplete={props.autoComplete}
      className="backoffice-input__field text-secondary text-secondary--detail"
      defaultValue={props.value}
      name={props.name}
      onChange={props.onChange}
      placeholder={capitalize(props.placeholder)}
      type="password"
    />
  </BackofficeInput>

BackofficeInputPhone.propTypes = {
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

BackofficeInputPhone.defaultProps = {
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

export default BackofficeInputPhone
