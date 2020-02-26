import React from 'react'
import PropTypes from 'prop-types'
import Input from './Input'

const InputEmail = props =>
  <Input {...props}>
    <input
      autoComplete={props.autoComplete}
      className="input__field text-sans text-sans--input"
      defaultValue={props.value}
      iconClassName={props.iconClassName}
      name={props.name}
      onBlur={e => { console.log(e) }}
      placeholder={props.placeholder}
      type="text"
    />
  </Input>

InputEmail.propTypes = {
  autoComplete: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  name: PropTypes.string,
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
  placeholder: 'your@email.com',
  isValid: false,
  validate: true,
  value: '',
}

export default InputEmail
