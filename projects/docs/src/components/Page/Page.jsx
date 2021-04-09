import React from 'react'
import PropTypes from 'prop-types'
import './Page.scss'

const Page = props =>
  <section className={`ds-page ${props.className}`}>
    {props.children}
  </section>

Page.propTypes = {
  className: PropTypes.string,
}

export default Page
