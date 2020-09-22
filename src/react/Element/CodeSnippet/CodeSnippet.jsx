import React from 'react'
import PropTypes from 'prop-types'
import './CodeSnippet.scss'

import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

const CodeSnippet = props =>
  <SyntaxHighlighter language={props.language} className={`code-snippet ${props.className}`} style={docco}>{props.code.trim()}</SyntaxHighlighter>

CodeSnippet.propTypes = {
  className: PropTypes.string,
  language: PropTypes.string,
  code: PropTypes.string,
}

CodeSnippet.defaultProps = {
  className: '',
  code: '',
  language: 'javascript',
}

export default CodeSnippet
