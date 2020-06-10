import React from 'react'
import PropTypes from 'prop-types'
import './Link.scss'

const Link = props =>
  <a className={`link ${props.className}`} href={props.href} target={`${props.href !== '#' ? '__blank' : '__self'}`}>{props.children}</a>

Link.propTypes = {
  className: PropTypes.string,
  href: PropTypes.string,
}

Link.defaultProps = {
  className: '',
  href: '#',
}

export default Link
