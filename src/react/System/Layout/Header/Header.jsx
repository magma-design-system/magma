import React from 'react'
import './Header.scss'

const Header = props =>
  <header className="sys-header">
    {props.children}
  </header>

export default Header
