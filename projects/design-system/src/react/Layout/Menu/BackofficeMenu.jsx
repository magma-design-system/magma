import React from 'react'
import PropTypes from 'prop-types'
import './BackofficeMenu.scss'

import H4 from '@Typography/H4/H4'
import Detail from '@Typography/Detail/Detail'
import Row from '@Layout/Row/Row'
import Grid from '@Layout/Grid/Grid'
import Icon from '@Design/Icon/Icon'

const BackofficeMenuItemTitle = props =>
  <Row align="top">
    <H4 htmlTag="div">
      <Icon name={props.icon} className="backoffice-menu__icon"/>
    </H4>
    <H4>{props.children}</H4>
  </Row>

BackofficeMenuItemTitle.propTypes = {
  icon: PropTypes.string,
}

BackofficeMenuItemTitle.defaultProps = {
  icon: 'save',
}

const BackofficeMenuItem = props =>
  <Grid className="backoffice-menu__item" rows="fit-vertically" gutter="none">
    {props.children}
  </Grid>

const BackofficeMenuItemAction = props =>
  <div onClick={props.onClick} className={`backoffice-menu-action text-secondary text-secondary--detail ${props.active ? 'backoffice-menu-action--active' : ''}`}>
    <Icon name={props.icon} className="backoffice-menu-action__icon"/>
    <Detail className="backoffice-menu-action__text">
      {props.children}
    </Detail>
  </div>

BackofficeMenuItemAction.propTypes = {
  active: PropTypes.bool,
  icon: PropTypes.string,
  onClick: PropTypes.func,
}

BackofficeMenuItemAction.defaultProps = {
  active: false,
  icon: 'save',
  onClick: () => {},
}

const BackofficeMenu = props =>
  <Grid className="backoffice-menu" rows="fit-vertically">
    { props.children }
  </Grid>

export default BackofficeMenu

export {
  BackofficeMenuItem,
  BackofficeMenuItemAction,
  BackofficeMenuItemTitle,
}
