import React from 'react'
import PropTypes from 'prop-types'
import './InlineCode.scss'
import Code from '@Typography/Code/Code'

import dictionary from './dictionary.json'

const InlineCode = props => {
  const { background, color } = props.status ? dictionary[props.status] : { background: '', color: '' }
  return <Code className={`inline-code ${props.className} ${props.status ? 'inline-code--status-' + props.status : ''} ${background} ${color}`}>
    {props.children}
  </Code>
}

InlineCode.propTypes = {
  className: PropTypes.string,
  status: PropTypes.string,
}

InlineCode.defaultProps = {
  className: '',
}

export default InlineCode
