import React from 'react'
import PropTypes from 'prop-types'
import './Button.scss'
import Icon from '@Design/Icon/Icon'

const FormButton = props => {
  const HtmlTag = props.htmlTag.toLowerCase()

  return (
    <HtmlTag
      className={`button ${props.className} ${props.variant ? 'button--' + props.variant : ''} ${props.small ? 'button--small' : ''} ${props.round ? 'button--round' : ''} ${props.disabled ? 'button--disabled' : ''} ${props.outline ? 'button--outline' : ''}`.trim()}
      onClick={() => props.onClick()}
      disabled={props.disabled ? 'disabled' : ''}>
      {props.icon && <Icon className='button__icon' name={props.icon}/>}
      { props.children && <div className={`button__text ${props.textClassName}`}>
        { props.children }
      </div>
      }
    </HtmlTag>
  )
}

FormButton.propTypes = {
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

FormButton.defaultProps = {
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

export default FormButton
