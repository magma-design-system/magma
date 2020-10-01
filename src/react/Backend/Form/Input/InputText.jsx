import React from 'react'
import PropTypes from 'prop-types'
import './Input.scss'
import Input from './Input'

const InputText = props =>
  <Input {...props}>
    <input
      autoComplete={props.autoComplete}
      className="backoffice-input__field text-sans text-sans--input"
      defaultValue={props.value}
      name={props.name}
      onChange={props.onChange}
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
  onChange: () => {},
  placeholder: '',
  value: 'default',
}

export default InputText
