import React from 'react'
import PropTypes from 'prop-types'
import './Menu.scss'

import H4 from '@Typography/H4/H4'
import Detail from '@Typography/Detail/Detail'
import Row from '@Layout/Row/Row'
import Grid from '@Layout/Grid/Grid'
import Icon from '@Design/Icon/Icon'

const MenuItemTitle = props =>
  <Row align="top">
    <div className="text-primary text-primary--h4">
      <Icon name={props.icon} className="backoffice-menu__icon"/>
    </div>
    <H4>{props.children}</H4>
  </Row>

MenuItemTitle.propTypes = {
  icon: PropTypes.string,
}

MenuItemTitle.defaultProps = {
  icon: 'save',
}

const MenuItem = props =>
  <Grid className="backoffice-menu__item" fit={true} gutter="none">
    {props.children}
  </Grid>

const MenuItemAction = props =>
  <div onClick={props.onClick} className={`backoffice-menu-action text-secondary text-secondary--detail ${props.active ? 'backoffice-menu-action--active' : ''}`}>
    <Icon name={props.icon} className="backoffice-menu-action__icon"/>
    <Detail className="backoffice-menu-action__text">
      {props.children}
    </Detail>
  </div>

MenuItemAction.propTypes = {
  active: PropTypes.bool,
  icon: PropTypes.string,
  onClick: PropTypes.func,
}

MenuItemAction.defaultProps = {
  active: false,
  icon: 'save',
  onClick: () => {},
}

const Menu = props =>
  <Grid className="backoffice-menu" fit={true}>
    { props.children }
  </Grid>

export default Menu

export {
  MenuItem,
  MenuItemAction,
  MenuItemTitle,
}
