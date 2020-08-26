import React from 'react'
import PropTypes from 'prop-types'
import './CodeSnippet.scss'
import Code from '@Typography/Code/Code'

const CodeSnippet = props =>
  <Code htmlTag="div" className={`code-snippet ${props.className}`}><pre className="code-snippet__block">{props.children}</pre></Code>

CodeSnippet.propTypes = {
  className: PropTypes.string,
}

CodeSnippet.defaultProps = {
  className: '',
}

export default CodeSnippet
