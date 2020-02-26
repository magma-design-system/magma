import React from 'react'
import PropTypes from 'prop-types'

const Typography = props => {
  const HtmlTag = props.htmlTag.toLowerCase()
  return (
    <HtmlTag className={`text-sans ${props.className}`}>
      {props.children}
    </HtmlTag>
  )
}

Typography.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Typography.defaultProps = {
  className: '',
  htmlTag: 'span',
}

export default Typography
