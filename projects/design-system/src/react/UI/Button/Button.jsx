import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Icon from '@Design/Icon/Icon'
import dictionary from './dictionary.json'
import './Button.scss'

const Button = ({ borderRadius, boxShadow, disabled, horizontalPadding, href, icon, onClick, outline, size, type, variant, width, ...restProps }) => {
  const { font, iconSize } = dictionary[size]
  let borderRadiusChoosen = dictionary[size].borderRadius
  if (borderRadius) {
    borderRadiusChoosen = borderRadius
  }

  let horizontalPaddingChoosen = dictionary[size].horizontalPadding
  if (horizontalPadding) {
    horizontalPaddingChoosen = horizontalPadding
  }

  const classes = styles('button', {
    selectors: [
      restProps.className,
    ],
    modifiers: {
      disabled,
      outline,
      size,
      variant,
      width,
    },
    scaffolded: {
      borderRadius: borderRadiusChoosen,
      boxShadow,
      horizontalPadding: horizontalPaddingChoosen,
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
  horizontalPadding: PropTypes.string,
  href: PropTypes.string,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  outline: PropTypes.bool,
  size: PropTypes.string,
  type: PropTypes.string,
  variant: PropTypes.string,
  width: PropTypes.string, // inline || fill
}

Button.defaultProps = {
  disabled: false,
  icon: '',
  onClick: () => {},
  outline: false,
  size: 'normal',
  type: 'button',
  width: 'inline',
}

export default Button
