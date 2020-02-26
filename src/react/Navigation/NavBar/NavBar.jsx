import React from 'react'
import PropTypes from 'prop-types'
import Icon from '../../Icon/Icon'
import './NavBar.scss'

const NavBar = props =>
  <div className="nav-bar">
    <Icon className="nav-bar__actions" name="menu"/>
    <div className="nav-bar__logo"></div>
    <Icon className="nav-bar__options" name="options"/>
  </div>

NavBar.propTypes = {
  className: PropTypes.string,
}

NavBar.defaultProps = {
  className: '',
}

export default NavBar
