import React from 'react'
import PropTypes from 'prop-types'
import Input from './Input'

const InputPhone = props =>
  <Input {...props}>
    <input
      autoComplete={props.autoComplete}
      className="input__field"
      defaultValue={props.value}
      name={props.name}
      onBlur={e => { console.log(e) }}
      placeholder={props.placeholder}
      pattern={props.pattern}
      type="tel"
    />
  </Input>

InputPhone.propTypes = {
  autoComplete: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  isValid: PropTypes.bool,
  name: PropTypes.string,
  pattern: PropTypes.string,
  placeholder: PropTypes.string,
  validate: PropTypes.bool,
  value: PropTypes.string,
}

InputPhone.defaultProps = {
  autoComplete: 'off',
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
