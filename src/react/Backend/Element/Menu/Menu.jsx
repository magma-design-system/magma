import React from 'react'
import PropTypes from 'prop-types'
import './Menu.scss'

import H4 from '@Typography/H4/H4'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Row from '@Layout/Row/Row'
import Grid from '@Layout/Grid/Grid'
import Icon from '@Design/Icon/Icon'

const MenuEntityTitle = props =>
  <Row align="top">
    <div className="text-primary text-primary--h4">
      <Icon name={props.icon} className="backend-menu__icon"/>
    </div>
    <H4>{props.children}</H4>
  </Row>

MenuEntityTitle.propTypes = {
  icon: PropTypes.string,
}

MenuEntityTitle.defaultProps = {
  icon: 'save',
}

const MenuEntity = props =>
  <Grid className="backend-menu__item" fit={true} gutter="none">
    {props.children}
  </Grid>

const MenuEntityAction = props =>
  <a className={`backend-menu-action ${props.active ? 'backend-menu-action--active' : ''}`} href="#">
    <Icon name={props.icon} className="backend-menu-action__icon"/>
    <Paragraph className="backend-menu-action__text">
      {props.children}
    </Paragraph>
  </a>

MenuEntityAction.propTypes = {
  active: PropTypes.bool,
  icon: PropTypes.string,
}

MenuEntityAction.defaultProps = {
  active: false,
  icon: 'save',
}

const Menu = props =>
  <Grid className="backend-menu">
    <MenuEntity>
      <MenuEntityTitle icon="book">Libri</MenuEntityTitle>
      <MenuEntityAction icon="list" to="/edit">Gestisci</MenuEntityAction>
      <MenuEntityAction active={true} icon="add" to="/new">Aggiungi</MenuEntityAction>
    </MenuEntity>
  </Grid>

export default Menu
