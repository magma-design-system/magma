import React, { Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import Row from '@Layout/Row/Row'
import Grid from '@Layout/Grid/Grid'
import Image from '@Content/Image/Image'
import Caption from '@Typography/Caption/Caption'
import Icon from '@Design/Icon/Icon'
import './Header.scss'

import { styles } from '@Library/styles'

const HeaderLogo = ({ className, headline, src, ...restProps }) => {
  const classes = styles('header__logo', {
    selectors: [
      className,
    ],
  })

  if (headline) {
    return <Grid gutter="none">
      <Image className={classes} src={src} {...restProps}/>
      <Caption className="text-adjust-tone-10">{ headline }</Caption>
    </Grid>
  }

  return <Image className={classes} src={src} {...restProps}/>
}

HeaderLogo.propTypes = {
  className: PropTypes.string,
  headline: PropTypes.string,
  src: PropTypes.string,
}

const HeaderMenu = ({ className, onClick, ...restProps }) => {
  const classes = styles('header__menu', {
    selectors: [
      className,
    ],
  })

  const children = Children.map(restProps.children, child => {
    if (child !== null) {
      return cloneElement(child, {
        className: `${child.props.className ? child.props.className : ''} header__item`,
      })
    }
  })

  return <Row {...restProps} width="inline" className={classes}>
    {children}
    <Icon name="menu-main" size="large" className="header__item header__item--action" onClick={onClick}/>
  </Row>
}

HeaderMenu.propTypes = {
  ...Row.propTypes,
  className: PropTypes.string,
  onClick: PropTypes.func,
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
