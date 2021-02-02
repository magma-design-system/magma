import React from 'react'
import PropTypes from 'prop-types'
import Input from '@UI/Input/Input'
import { capitalize } from '@UI/Select/functions'

const InputPhone = props =>
  <Input {...props}>
    <input
      autoComplete={props.autoComplete}
      className={`input__field ${props.font}`}
      defaultValue={props.value}
      name={props.name}
      onBlur={e => { console.log(e) }}
      placeholder={capitalize(props.placeholder)}
      pattern={props.pattern}
      type="tel"
    />
  </Input>

InputPhone.propTypes = {
  autoComplete: PropTypes.string,
  font: PropTypes.string,
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
