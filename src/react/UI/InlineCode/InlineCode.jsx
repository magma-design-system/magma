import React from 'react'
import PropTypes from 'prop-types'
import './InlineCode.scss'
import Code from '@Typography/Code/Code'

const InlineCode = props =>
  <Code className={`inline-code ${props.className}`}>
    {props.children}
  </Code>

InlineCode.propTypes = {
  className: PropTypes.string,
}

InlineCode.defaultProps = {
  className: '',
}

export default InlineCode
