import React, { Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './UList.scss'

import Icon from '@Design/Icon/Icon'
import H5 from '@Typography/H5/H5'

const defaultIcon = 'list-dot'

/* eslint-disable no-nested-ternary */

const UListItem = ({ autoPunctuation, className, icon, iconClassName, iconSize, id, last, numeric, ...restProps }) =>
  <li className={`u-list__item ${className}`} {...restProps}>
    {numeric
      ? <H5 className="u-list__numeric">{ id + 1 }.</H5>
      : <Icon className={`u-list__icon ${iconClassName}`} name={icon} size={iconSize}/>
    }
    <div className="u-list__text">
      {restProps.children}
      {autoPunctuation ? last ? '.' : ';' : ''}
    </div>
  </li>

UListItem.propTypes = {
  autoPunctuation: PropTypes.bool,
  className: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  iconSize: PropTypes.string,
  id: PropTypes.number,
  last: PropTypes.bool,
  numeric: PropTypes.bool,
}

UListItem.defaultProps = {
  autoPunctuation: false,
  className: '',
  iconSize: '',
  numeric: false,
}

const UList = ({ autoPunctuation, className, icon, iconClassName, iconSize, numeric, text, ...restProps }) => {
  const children = Children.map(restProps.children, (child, index) => {
    return cloneElement(child, {
      autoPunctuation,
      icon: child.props.icon !== undefined ? child.props.icon : icon,
      iconClassName: child.props.iconClassName !== undefined ? child.props.iconClassName : iconClassName,
      iconSize: child.props.iconSize === '' ? iconSize : child.props.iconSize,
      id: index,
      last: restProps.children.length === index + 1,
      numeric,
    })
  })

  const classes = styles('u-list', {
    selectors: [
      className,
      text,
    ],
  })

  return <ul className={classes}>
    {children}
  </ul>
}

UList.propTypes = {
  autoPunctuation: PropTypes.bool,
  className: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  iconSize: PropTypes.string,
  numeric: PropTypes.bool,
  text: PropTypes.string,
}

UList.defaultProps = {
  autoPunctuation: false,
  className: '',
  icon: defaultIcon,
  iconClassName: '',
  iconSize: 'small',
  numeric: false,
  text: 'text-secondary text-secondary--paragraph',
}

export default UList
export {
  UListItem,
}
