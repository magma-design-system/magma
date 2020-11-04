import React from 'react'
import PropTypes from 'prop-types'
import './Avatar.scss'

const Avatar = props =>
  <img className={`avatar ${props.className} ${props.size ? 'avatar--size-' + props.size : ''}`} loading="lazy" src={props.url}/>

Avatar.propTypes = {
  className: PropTypes.string,
  size: PropTypes.string,
  url: PropTypes.string,
}

Avatar.defaultProps = {
  className: '',
  size: 'normal',
}

export default Avatar
