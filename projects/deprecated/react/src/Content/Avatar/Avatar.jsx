import React from 'react'
import MD5 from 'crypto-js/md5'
import PropTypes from 'prop-types'
import './Avatar.scss'

const Avatar = props => {
  let { src } = props

  if (props.gravatar) {
    const indexSize = 1
    const email = MD5(props.gravatar.split('?')[0].trim().toLowerCase()).toString()
    const params = props.gravatar.split('?')[indexSize]
    src = `https://www.gravatar.com/avatar/${email}?${params}`
  }

  return <img className={`avatar ${props.className} ${props.size ? 'avatar--size-' + props.size : ''}`} loading="lazy" src={src}/>
}

Avatar.propTypes = {
  className: PropTypes.string,
  gravatar: PropTypes.string,
  size: PropTypes.string,
  src: PropTypes.string,
}

Avatar.defaultProps = {
  className: '',
  size: 'normal',
}

export default Avatar
