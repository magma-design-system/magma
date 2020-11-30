import React from 'react'
import PropTypes from 'prop-types'
import './BackofficeInput.scss'
import BackofficeInput from '@UI/Input/BackofficeInput'
import { capitalize } from '@UI/Select/functions'

const BackofficeInputText = props =>
  <BackofficeInput {...props}>
    <input
      autoComplete={props.autoComplete}
      className="backoffice-input__field text-secondary text-secondary--detail"
      defaultValue={props.value}
      name={props.name}
      onChange={props.onChange}
      placeholder={capitalize(props.placeholder)}
      type="text"
    />
  </BackofficeInput>

BackofficeInputText.propTypes = {
  autoComplete: PropTypes.string,
  icon: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.string,
}

BackofficeInputText.defaultProps = {
  autoComplete: 'off',
  icon: '',
  iconClassName: '',
  name: 'unassigned',
  onChange: () => {},
  placeholder: '',
  required: false,
  value: '',
}

export default BackofficeInputText
