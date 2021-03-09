import React from 'react'
import PropTypes from 'prop-types'
import Row from '@Layout/Row/Row'
import Image from '@Content/Image/Image'
import './Header.scss'

import { styles } from '@Library/styles'

const HeaderLogo = ({ className, src, ...restProps }) => {
  const classes = styles('header__logo', {
    selectors: [
      className,
    ],
  })

  return <Image className={classes} src={src}/>
}

HeaderLogo.propTypes = {
  className: PropTypes.string,
  src: PropTypes.string,
}

const HeaderMenu = ({ className, ...restProps }) => {
  const classes = styles('header__menu', {
    selectors: [
      className,
    ],
  })

  return <Row {...restProps} className={classes}>
    {restProps.children}
  </Row>
}

HeaderMenu.propTypes = {
  ...Row.propTypes,
  className: PropTypes.string,
}

HeaderMenu.defaultProps = {
  className: 'overflow-visible',
}

const Header = ({ className, boxShadow, ...restProps }) => {
  const classes = styles('header', {
    selectors: [
      className,
    ],
    scaffolded: {
      boxShadow,
    },
  })

  return <div className={classes}>
    <Row {...restProps} className="header__row view-limit">
      {restProps.children}
    </Row>
  </div>
}

Header.propTypes = {
  ...Row.propTypes,
  boxShadow: PropTypes.string,
  className: PropTypes.string,
}

Header.defaultProps = {
  boxShadow: 'soft',
}

export default Header
export {
  HeaderLogo,
  HeaderMenu,
}
