import React from 'react'
import PropTypes from 'prop-types'
import './CodeSnippet.scss'

const CodeSnippet = props =>
  <pre className="mds-code-snippet text-mono text-mono--code">{ props.code.trim() }</pre>

CodeSnippet.propTypes = {
  className: PropTypes.string,
  code: PropTypes.string,
}

CodeSnippet.defaultProps = {
  className: '',
  code: '',
}

export default CodeSnippet
