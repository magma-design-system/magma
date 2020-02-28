import React from 'react'
import PropTypes from 'prop-types'
import './Button.scss'
import Icon from '../../../Design/Icon/Icon'

const Button = props =>
  <button
    className={`button ${props.className} ${props.disabled ? 'button--disabled' : ''}`.trim()}
    onClick={() => props.onClick()}
    disabled={props.disabled ? 'disabled' : ''}>
    {props.icon && <Icon className='button__icon' name={props.icon}/>}
    <div className='button__text text-sans text-sans--button'>{props.children}</div>
  </button>

Button.propTypes = {
  className: PropTypes.string,
  collapse: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  onClick: PropTypes.func,
}

Button.defaultProps = {
  className: '',
  collapse: false,
  disabled: false,
  icon: '',
  onClick: () => {},
}

export default Button
