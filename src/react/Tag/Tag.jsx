import React from 'react'
import PropTypes from 'prop-types'
import './Tag.scss'
import Icon from '../Icon/Icon'

const Tag = props =>
  <div className={`tag ${props.className}`}>
    <Icon paletteColor={props.paletteColor} name={props.icon} className={`tag__icon ${props.iconClassName}`}/>
    <div className="tag__text">
      {props.children}
    </div>
  </div>

Tag.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  paletteColor: PropTypes.string,
}

Tag.defaultProps = {
  className: '',
  icon: 'tag',
  iconClassName: '',
  paletteColor: 'inherit',
}

export default Tag
