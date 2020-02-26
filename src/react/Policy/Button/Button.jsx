import React from 'react'
import PropTypes from 'prop-types'
import './Button.scss'
import action from './ButtonDictionary'
import Icon from '../../Common/Icon/Icon'

const Button = props =>
  <button
    className={`button ${props.className} ${(props.size ? 'button--' + props.size : '')} ${action[props.action]} ${props.disabled ? 'button--disabled' : ''} ${props.collapse ? 'button--collapse' : ''}`.trim()}
    onClick={() => props.onClick()}
    disabled={props.disabled ? 'disabled' : ''}>
    {props.icon && <Icon className='button__icon' name={props.icon}/>}
    <div className='button__text'>{props.children}</div>
  </button>

Button.propTypes = {
  action: PropTypes.string,
  className: PropTypes.string,
  collapse: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.string,
}

Button.defaultProps = {
  action: 'default',
  className: '',
  collapse: false,
  disabled: false,
  icon: '',
  onClick: () => {},
  size: '',
}

export default Button
