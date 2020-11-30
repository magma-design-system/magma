import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './Tag.scss'
import Icon from '@Design/Icon/Icon'

const Tag = ({ chip, className, icon, iconClassName, ...restProps }) => {
  const classes = styles('tag', {
    selectors: [
      className,
    ],
    modifiers: {
      chip,
    },
  })

  return <div className={classes}>
    <Icon name={icon} className={`tag__icon ${iconClassName}`}/>
    <div className="tag__text">
      {restProps.children}
    </div>
  </div>
}

Tag.propTypes = {
  chip: PropTypes.bool,
  className: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
}

Tag.defaultProps = {
  chip: false,
  className: '',
  icon: 'tag',
  iconClassName: '',
}

export default Tag
