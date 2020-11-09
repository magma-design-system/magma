import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import './Button.scss'
import Icon from '@Design/Icon/Icon'

const Button = props =>
  <Fragment>
    {!props.href
      ? <button
        className={`button ${props.className} ${props.variant ? 'button--' + props.variant : ''} ${props.small ? 'button--small' : ''} ${props.round ? 'button--round' : ''} ${props.disabled ? 'button--disabled' : ''} ${props.outline ? 'button--outline' : ''}`.trim()}
        onClick={() => props.onClick()}
        disabled={props.disabled ? 'disabled' : ''}
        type={props.type}>
        {props.icon && <Icon className='button__icon' name={props.icon}/>}
        { props.children && <div className={`button__text ${props.textClassName}`}>
          { props.children }
        </div>
        }
      </button>
      : <a
        className={`button ${props.className} ${props.variant ? 'button--' + props.variant : ''} ${props.small ? 'button--small' : ''} ${props.round ? 'button--round' : ''} ${props.disabled ? 'button--disabled' : ''} ${props.outline ? 'button--outline' : ''}`.trim()}
        onClick={() => props.onClick()}
        target="_blank"
        href={props.href}>
        {props.icon && <Icon className='button__icon' name={props.icon}/>}
        { props.children && <div className={`button__text ${props.textClassName}`}>
          { props.children }
        </div>
        }
      </a>
    }
  </Fragment>

Button.propTypes = {
  className: PropTypes.string,
  collapse: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  outline: PropTypes.bool,
  round: PropTypes.bool,
  small: PropTypes.bool,
  href: PropTypes.string,
  textClassName: PropTypes.string,
  variant: PropTypes.string,
}

Button.defaultProps = {
  className: '',
  collapse: false,
  disabled: false,
  type: 'button',
  icon: '',
  onClick: () => {},
  outline: false,
  round: false,
  small: false,
  textClassName: 'text-primary text-primary--button',
  variant: '',
}

export default Button
