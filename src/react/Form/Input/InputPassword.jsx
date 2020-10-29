import React from 'react'
import PropTypes from 'prop-types'
import './Input.scss'
import Input from './Input'

const InputPassword = props =>
  <Input {...props}>
    <input
      autoComplete={props.autoComplete}
      className={`input__field ${props.font}`}
      defaultValue={props.value}
      name={props.name}
      onChange={props.onChange}
      placeholder={props.placeholder}
      type="password"
    />
  </Input>

InputPassword.propTypes = {
  autoComplete: PropTypes.string,
  font: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
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
  placeholder: '',
  value: '',
}

export default InputPassword
