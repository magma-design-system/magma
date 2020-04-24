import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import './Button.scss'
import { ThemeContext } from '@Design/Theme/ThemeProvider'
import Icon from '@Design/Icon/Icon'

const Button = props => {
  const state = useContext(ThemeContext)
  const themeName = `button--${state.name}`
  const HtmlTag = props.htmlTag.toLowerCase()

  return (
    <HtmlTag
      className={`button ${props.className} button--${props.variant} ${props.small ? 'button--small' : ''} ${props.round ? 'button--round' : ''} ${themeName} ${props.disabled ? 'button--disabled' : ''}`.trim()}
      onClick={() => props.onClick()}
      disabled={props.disabled ? 'disabled' : ''}>
      {props.icon && <Icon className='button__icon' name={props.icon}/>}
      <div className={`button__text ${props.textClassName}`}>{props.children}</div>
    </HtmlTag>
  )
}

Button.propTypes = {
  className: PropTypes.string,
  collapse: PropTypes.bool,
  disabled: PropTypes.bool,
  htmlTag: PropTypes.string,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  small: PropTypes.bool,
  round: PropTypes.bool,
  textClassName: PropTypes.string,
  variant: PropTypes.string,
}

Button.defaultProps = {
  className: '',
  collapse: false,
  disabled: false,
  htmlTag: 'button',
  icon: '',
  onClick: () => {},
  small: false,
  round: false,
  textClassName: 'text-primary text-primary--button',
  variant: 'primary',
}

export default Button
