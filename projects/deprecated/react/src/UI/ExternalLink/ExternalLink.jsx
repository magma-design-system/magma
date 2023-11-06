import React from 'react'
import PropTypes from 'prop-types'
import './ExternalLink.scss'

const ExternalLink = props =>
  <a className={`external-link ${props.className}`} href={props.href} target={`${props.href !== '#' ? '__blank' : '__self'}`}>{props.children}</a>

ExternalLink.propTypes = {
  className: PropTypes.string,
  href: PropTypes.string,
}

ExternalLink.defaultProps = {
  className: '',
  href: '#',
}

export default ExternalLink
