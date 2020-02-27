import React from 'react'
import PropTypes from 'prop-types'
import './Input.scss'
import Input from './Input'

const InputText = props =>
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

InputText.propTypes = {
  autoComplete: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.string,
}

InputText.defaultProps = {
  autoComplete: 'off',
  icon: '',
  iconClassName: '',
  name: 'unassigned',
  onChange: value => { return value },
  placeholder: '',
  value: '',
}

export default InputText
