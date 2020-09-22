import React from 'react'
import PropTypes from 'prop-types'
import './Tag.scss'
import Icon from '@Design/Icon/Icon'

const Tag = props =>
  <div className={`tag ${props.className} ${props.chip ? 'tag--chip' : ''}`}>
    <Icon name={props.icon} className={`tag__icon ${props.iconClassName}`}/>
    <div className="tag__text">
      {props.children}
    </div>
  </div>

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
