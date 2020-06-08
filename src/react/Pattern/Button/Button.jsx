import React from 'react'
import PropTypes from 'prop-types'
import FormButton from '@Form/Button/Button'
import faker from 'faker'

const Paragraph = props =>
  <FormButton
    className={`text-secondary text-secondary--paragraph ${props.className}`}
    htmlTag={props.htmlTag}
    {...props}
  >
    { props.children ? props.children : faker.hacker.verb() }
  </FormButton>

Paragraph.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Paragraph.defaultProps = {
  className: '',
  htmlTag: 'div',
}

export default Paragraph
