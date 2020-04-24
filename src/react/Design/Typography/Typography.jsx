import React from 'react'
import PropTypes from 'prop-types'
import faker from 'faker'

const Typography = props => {
  const HtmlTag = props.htmlTag.toLowerCase()
  return (
    <HtmlTag className={`${props.className}`}>
      { props.children ? props.children : faker.lorem.paragraph() }
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
