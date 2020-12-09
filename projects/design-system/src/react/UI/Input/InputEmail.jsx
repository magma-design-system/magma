import React from 'react'
import PropTypes from 'prop-types'
import Input from '@UI/Input/Input'

const InputEmail = ({ autoComplete, font, name, placeholder, value, ...restProps }) => {
  return <Input {...restProps}>
    <input
      autoComplete={autoComplete}
      className={`input__field ${font}`}
      defaultValue={value}
      name={name}
      placeholder={placeholder}
      type="email"
    />
  </Input>
}

InputEmail.propTypes = {
  ...Input.propTypes,
  autoComplete: PropTypes.string,
  font: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  isValid: PropTypes.bool,
  validate: PropTypes.bool,
  value: PropTypes.string,
}

InputEmail.defaultProps = {
  autoComplete: 'off',
  font: 'text-secondary text-secondary--detail',
  icon: 'document-email',
  iconClassName: '',
  name: 'email',
  placeholder: 'tua@email.com',
  isValid: false,
  validate: true,
  value: '',
}

export default InputEmail
