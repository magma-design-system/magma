import React from 'react'
import PropTypes from 'prop-types'
import './Input.scss'
import Icon from '@Design/Icon/Icon'
import H3 from '@Typography/H3/H3'

const Input = props =>
  <label className={`backoffice-input ${props.value ? 'backoffice-input--filled' : ''} ${props.icon !== '' ? 'backoffice-input--has-icon' : ''} ${Object.keys(props.errors).length > 0 ? 'backoffice-input--has-errors' : ''} ${props.className}`}>
    {props.label &&
      <H3 htmlTag="div" className="backoffice-input__label">
        {props.label}
      </H3>
    }
    {props.icon &&
      <div className="backoffice-input__icon-area">
        <Icon className={`backoffice-input__icon ${props.iconClassName !== '' ? props.iconClassName : ''}`} name={props.icon}/>
      </div>
    }
    {props.children}
    <ul className="backoffice-input__errors">
      {Object.keys(props.errors).map(name =>
        <li className="backoffice-input__error">
          <Icon className="backoffice-input__error-icon" name={props.errors[name].type}/>
          {props.errors[name].message}
        </li>,
      )}
    </ul>
  </label>

Input.propTypes = {
  className: PropTypes.string,
  errors: PropTypes.obj,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  label: PropTypes.string,
  theme: PropTypes.string,
  value: PropTypes.string,
}

Input.defaultProps = {
  className: '',
  errors: {},
  icon: '',
  iconClassName: '',
  label: '',
}

export default Input
