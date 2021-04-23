import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'
import Row from '@Layout/Row/Row'

const SectionMenuItem = props =>
  <Link className={`px-3 py-1 rounded-lg hover:bg-adjust-tone-18 cursor-pointer transition-colors ${props.active ? 'bg-adjust-tone-04 text-adjust-tone-19 pointer-events-none' : ''} ${props.className}`}>
    {props.children}
  </Link>

SectionMenuItem.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
}

SectionMenuItem.defaultProps = {
  active: false,
}

const SectionMenu = props =>
  <Row gutter="small" className="px-7 mt-10 items-center">
    {props.children}
  </Row>

export default SectionMenu
export {
  SectionMenuItem,
}
