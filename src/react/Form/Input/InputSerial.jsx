import React from 'react'
import PropTypes from 'prop-types'
import './Input.scss'
import Input from './Input'

const InputSerial = props =>
  <Input icon={props.icon}>
    <input
      autoComplete={props.autoComplete}
      className="input__field text-sans text-sans--input"
      defaultValue={props.value}
      iconClassName={props.iconClassName}
      name={props.name}
      onChange={e => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      type="text"
    />
  </Input>

InputSerial.propTypes = {
  autoComplete: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.string,
}

InputSerial.defaultProps = {
  autoComplete: 'off',
  icon: 'serial',
  iconClassName: '',
  name: 'unassigned',
  onChange: value => { return value },
  placeholder: '9203102390',
  value: '',
}

export default InputSerial
