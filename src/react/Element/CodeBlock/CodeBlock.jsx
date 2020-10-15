import React from 'react'
import PropTypes from 'prop-types'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { tomorrowNightEighties, qtcreatorLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import './CodeBlock.scss'

const theme = {
  dark: {
    style: tomorrowNightEighties,
    font: 'text-mono text-mono--code',
  },
  light: {
    style: qtcreatorLight,
    font: 'text-mono text-mono--hack',
  },
}

const CodeBlock = props =>
  <div className={`code-block code-block--${props.theme} ${theme[props.theme].font}`}>
    <SyntaxHighlighter language={props.language} style={theme[props.theme].style}>
      {props.children || props.code}
    </SyntaxHighlighter>
  </div>

CodeBlock.propTypes = {
  className: PropTypes.string,
  language: PropTypes.string,
  code: PropTypes.string,
  showLineNumbers: PropTypes.bool,
  theme: PropTypes.string,
  wrapLines: PropTypes.bool,
  wrapLongLines: PropTypes.bool,
}

CodeBlock.defaultProps = {
  className: '',
  language: 'javascript',
  showLineNumbers: false,
  theme: 'light',
  wrapLines: false,
  wrapLongLines: false,
}

export default CodeBlock
