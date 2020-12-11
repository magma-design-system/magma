import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Icon from '@Design/Icon/Icon'
import dictionary from './dictionary.json'
import './Button.scss'

const Button = ({ borderRadius, boxShadow, disabled, href, icon, onClick, outline, padding, size, type, variant, width, ...restProps }) => {
  const { font, iconSize } = dictionary[size]
  let borderRadiusChoosen = dictionary[size].borderRadius
  if (borderRadius) {
    borderRadiusChoosen = borderRadius
  }
  const classes = styles('button', {
    selectors: [
      restProps.className,
    ],
    modifiers: {
      disabled,
      outline,
      padding,
      size,
      variant,
      width,
    },
    scaffolded: {
      borderRadius: borderRadiusChoosen,
      boxShadow,
    },
  })

  return <Fragment>
    {!href
      ? <button
        className={classes}
        onClick={onClick}
        disabled={disabled ? 'disabled' : ''}
        type={type}>
        {icon && <Icon className='button__icon' name={icon} size={iconSize}/>}
        { restProps.children && <div className={`button__text ${font}`}>
          { restProps.children }
        </div>
        }
      </button>
      : <a
        className={classes}
        onClick={onClick}
        target="_blank"
        href={href}>
        {icon && <Icon className='button__icon' name={icon} size={iconSize}/>}
        { restProps.children && <div className={`button__text ${font}`}>
          { restProps.children }
        </div>
        }
      </a>
    }
  </Fragment>
}

Button.propTypes = {
  borderRadius: PropTypes.string,
  boxShadow: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  href: PropTypes.string,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  outline: PropTypes.bool,
  padding: PropTypes.string,
  size: PropTypes.string,
  type: PropTypes.string,
  variant: PropTypes.string,
  width: PropTypes.string, // inline || fill
}

Button.defaultProps = {
  className: '',
  disabled: false,
  icon: '',
  onClick: () => {},
  outline: false,
  size: 'normal',
  type: 'button',
  width: 'inline',
}

export default Button
