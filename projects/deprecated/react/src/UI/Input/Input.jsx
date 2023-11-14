import React from 'react'
import PropTypes from 'prop-types'
import './Input.scss'
import Icon from '@Design/Icon/Icon'
import Detail from '@Typography/Detail/Detail'

const Input = props => {
  // const state = useContext(ThemeContext)
  // const themeName = `input--${state.name}`

  return (
    <label className={`input ${props.icon ? 'input--has-icon' : ''} ${props.error ? 'input--has-errors' : ''} ${props.grow ? 'input--grow' : ''} ${props.fill ? 'input--fill' : ''} ${props.theme !== '' ? 'input--' + props.theme : ''} ${props.className}`}>
      {props.label &&
        <div className="input__label text-secondary text-secondary--label-paragraph">
          {props.label}
        </div>
      }
      {props.icon &&
        <div className="input__icon-area">
          <Icon className={`input__icon ${props.iconClassName !== '' ? props.iconClassName : ''}`} name={props.icon}/>
        </div>
      }
      {props.children}
      {props.error &&
        <div className="input__message">
          <Detail htmlTag="div" className="input__error">
            <Icon className="input__error-icon" name="status-error"/>
            <div className="input__error-text">{props.error}</div>
          </Detail>
        </div>
      }
    </label>
  )
}

Input.propTypes = {
  className: PropTypes.string,
  error: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  label: PropTypes.string,
  theme: PropTypes.string,
  fill: PropTypes.bool,
  grow: PropTypes.bool,
}

Input.defaultProps = {
  className: '',
  fill: true,
  grow: false,
  icon: '',
  iconClassName: '',
  label: '',
  theme: '',
}

export default Input
