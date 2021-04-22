import React from 'react'
import PropTypes from 'prop-types'
import { id } from '@Library/markup'

const Typography = props => {
  const HtmlTag = props.htmlTag.toLowerCase()
  return <HtmlTag id={id(props.id, props.children)} className={props.className}>
    { props.children }
  </HtmlTag>
}

Typography.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
  id: PropTypes.any,
}

Typography.defaultProps = {
  className: '',
  htmlTag: 'span',
  id: false,
}

export default Typography
