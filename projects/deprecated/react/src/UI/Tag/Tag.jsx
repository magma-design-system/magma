import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './Tag.scss'
import Icon from '@Design/Icon/Icon'
import dictionary from './dictionary.json'

const Tag = ({ chip, className, icon, iconClassName, size, status, ...restProps }) => {
  const { font, iconSize, horizontalPadding } = dictionary.size[size]
  const background = status ? dictionary.status[status].background : ''
  const iconClassStatus = status ? dictionary.status[status].icon : ''
  const color = status ? dictionary.status[status].color : ''

  const classes = styles('tag', {
    selectors: [
      className,
      background,
      color,
    ],
    modifiers: {
      size,
      chip,
    },
    scaffolded: {
      horizontalPadding,
    },
  })

  const iconClasses = styles('tag__icon', {
    selectors: [
      iconClassName,
      iconClassStatus,
    ],
  })

  return <div className={classes} {...restProps}>
    {icon && <Icon name={icon} size={iconSize} className={iconClasses}/>}
    <div className={`tag__text ${font}`}>
      {restProps.children}
    </div>
  </div>
}

Tag.propTypes = {
  chip: PropTypes.bool,
  className: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.string,
  status: PropTypes.string,
}

Tag.defaultProps = {
  chip: false,
  className: '',
  iconClassName: '',
  size: 'normal',
}

export default Tag
