import React from 'react'
import PropTypes from 'prop-types'
import Input from './Input'

const InputPhone = props =>
  <Input {...props}>
    <input
      autoComplete={props.autoComplete}
      className="input__field text-sans text-sans--input"
      defaultValue={props.value}
      iconClassName={props.iconClassName}
      name={props.name}
      onBlur={e => { console.log(e) }}
      placeholder={props.placeholder}
      type="tel"
    />
  </Input>

InputPhone.propTypes = {
  autoComplete: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  isValid: PropTypes.bool,
  validate: PropTypes.bool,
  value: PropTypes.string,
}

InputPhone.defaultProps = {
  autoComplete: 'off',
  icon: 'phone',
  iconClassName: '',
  name: 'phone',
  placeholder: '+39 123 4567890',
  isValid: false,
  validate: true,
  value: '',
}

export default InputPhone
