import React from 'react'
import PropTypes from 'prop-types'
import './Quote.scss'

import Paragraph from '@Typography/Paragraph/Paragraph'
import H4 from '@Typography/H4/H4'
import Grid from '@Layout/Grid/Grid'

const Quote = props =>
  <Grid htmlTag="blockquote" gutter="xsmall" className={`quote ${props.className}`}>
    <H4 htmlTag="div" className="quote__content">
      <div className="quote__text">{props.children}</div>
    </H4>
    <Paragraph className="quote__author">{props.author}</Paragraph>
  </Grid>

Quote.propTypes = {
  author: PropTypes.string,
  className: PropTypes.string,
}

Quote.defaultProps = {
  author: 'Unknown source',
  className: '',
}

export default Quote
