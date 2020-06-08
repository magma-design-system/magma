import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import './Button.scss'
import { ThemeContext } from '@Design/Theme/ThemeProvider'
import Icon from '@Design/Icon/Icon'
import faker from 'faker'

const Button = props => {
  const state = useContext(ThemeContext)
  const themeName = state.name !== undefined ? `button--${state.name}` : ''
  const HtmlTag = props.htmlTag.toLowerCase()

  return (
    <HtmlTag
      className={`button ${props.className} ${props.variant ? 'button--' + props.variant : ''} ${props.small ? 'button--small' : ''} ${props.round ? 'button--round' : ''} ${themeName} ${props.disabled ? 'button--disabled' : ''} ${props.outline ? 'button--outline' : ''}`.trim()}
      onClick={() => props.onClick()}
      disabled={props.disabled ? 'disabled' : ''}>
      {props.icon && <Icon className='button__icon' name={props.icon}/>}
      <div className={`button__text ${props.textClassName}`}>
        { props.children ? props.children : faker.hacker.phrase() }
      </div>
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
  outline: PropTypes.bool,
  round: PropTypes.bool,
  small: PropTypes.bool,
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
  outline: false,
  round: false,
  small: false,
  textClassName: 'text-primary text-primary--button',
  variant: '',
}

export default Button
