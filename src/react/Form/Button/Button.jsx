import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import './Button.scss'
import { ThemeContext } from '@Design/Theme/ThemeProvider'
import Icon from '@Design/Icon/Icon'

const Button = props => {
  const state = useContext(ThemeContext)
  const themeName = `button--${state.name}`

  return (
    <button
      className={`button ${props.className} ${themeName} ${props.disabled ? 'button--disabled' : ''}`.trim()}
      onClick={() => props.onClick()}
      disabled={props.disabled ? 'disabled' : ''}>
      {props.icon && <Icon className='button__icon' name={props.icon}/>}
      <div className={`button__text ${props.textClassName}`}>{props.children}</div>
    </button>
  )
}

Button.propTypes = {
  className: PropTypes.string,
  collapse: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  textClassName: PropTypes.string,
}

Button.defaultProps = {
  className: '',
  collapse: false,
  disabled: false,
  icon: '',
  onClick: () => {},
  textClassName: 'text-primary text-primary--button',
}

export default Button
