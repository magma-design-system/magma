import React from 'react'
import PropTypes from 'prop-types'
import Typography from '../Typography'
import faker from 'faker'

const Paragraph = props =>
  <Typography
    className={`text-sans--paragraph ${props.className}`}
    htmlTag={props.htmlTag}
  >
    { props.children ? props.children : faker.lorem.paragraph() }
  </Typography>

Paragraph.propTypes = {
  className: PropTypes.string,
  htmlTag: PropTypes.string,
}

Paragraph.defaultProps = {
  className: '',
  htmlTag: 'p',
}

export default Paragraph
