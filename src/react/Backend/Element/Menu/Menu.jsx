import React from 'react'
import PropTypes from 'prop-types'
import './Menu.scss'

import H4 from '@Typography/H4/H4'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Row from '@Layout/Row/Row'
import Grid from '@Layout/Grid/Grid'
import Icon from '@Design/Icon/Icon'

const MenuItemTitle = props =>
  <Row align="top">
    <div className="text-primary text-primary--h4">
      <Icon name={props.icon} className="backend-menu__icon"/>
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
  <Grid className="backend-menu__item" fit={true} gutter="none">
    {props.children}
  </Grid>

const MenuItemAction = props =>
  <a className={`backend-menu-action ${props.active ? 'backend-menu-action--active' : ''}`} href="#">
    <Icon name={props.icon} className="backend-menu-action__icon"/>
    <Paragraph className="backend-menu-action__text">
      {props.children}
    </Paragraph>
  </a>

MenuItemAction.propTypes = {
  active: PropTypes.bool,
  icon: PropTypes.string,
}

MenuItemAction.defaultProps = {
  active: false,
  icon: 'save',
}

const Menu = props =>
  <Grid className="backend-menu">
    { props.children }
  </Grid>

export default Menu

export {
  MenuItem,
  MenuItemAction,
  MenuItemTitle,
}
