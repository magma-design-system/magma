import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { ThemeContext } from '@Design/Theme/ThemeProvider'
import './Input.scss'
import Icon from '@Design/Icon/Icon'

const Input = props => {
  const state = useContext(ThemeContext)
  const themeName = `input--${state.name}`

  return (
    <label className={`input ${themeName} ${props.icon ? 'input--has-icon' : ''} ${Object.keys(props.errors).length > 0 ? 'input--has-errors' : ''} ${props.theme !== '' ? 'input--' + props.theme : ''} ${props.className}`}>
      {props.label &&
        <div className="input__label text-primary text-primary--h6">
          {props.label}
        </div>
      }
      {props.icon &&
        <div className="input__icon-area">
          <Icon className={`input__icon ${props.iconClassName !== '' ? props.iconClassName : ''}`} name={props.icon}/>
        </div>
      }
      {props.children}
      <ul className="input__errors">
        {Object.keys(props.errors).map(name =>
          <li className="input__error">
            <Icon className="input__error-icon" name={props.errors[name].type}/>
            {props.errors[name].message}
          </li>,
        )}
      </ul>
    </label>
  )
}

Input.propTypes = {
  className: PropTypes.string,
  errors: PropTypes.obj,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  label: PropTypes.string,
  theme: PropTypes.string,
}

Input.defaultProps = {
  className: '',
  errors: {},
  icon: '',
  iconClassName: '',
  label: '',
  theme: '',
}

export default Input
