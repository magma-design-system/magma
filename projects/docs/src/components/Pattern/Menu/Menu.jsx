import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'
import { Link } from 'gatsby'
import H2 from '@Typography/H2/H2'
import './Menu.scss'

const MenuSubItem = props =>
  <div className={`ds-menu-child ${props.active ? 'ds-menu-child--active' : ''}`}>
    <Link to={props.url} className="ds-menu-child__title text-primary text-primary--h5">
      {props.title}
    </Link>
  </div>

MenuSubItem.propTypes = {
  className: PropTypes.string,
  active: PropTypes.bool,
  title: PropTypes.string,
  url: PropTypes.string,
}

MenuSubItem.defaultProps = {
  className: '',
  active: false,
  title: 'Menu sub item',
  url: '#',
}

const MenuItem = props =>
  <Grid gutter="none" rows="fit-vertically" className={`ds-menu-item ${props.active ? 'ds-menu-item--active' : ''} ${props.isOpened ? 'ds-menu-item--opened' : ''}`}>
    <div className="ds-menu-item__section">
      <Link to={props.url} className="ds-menu-item__title text-primary text-primary--h4">
        {props.title}
      </Link>
    </div>
    {props.children && <Grid gutter="none" rows="fit-vertically" className="ds-menu-item__list">
      {props.children}
    </Grid>}
  </Grid>

MenuItem.propTypes = {
  className: PropTypes.string,
  isOpened: PropTypes.bool,
  active: PropTypes.bool,
  title: PropTypes.string,
  url: PropTypes.string,
}

MenuItem.defaultProps = {
  className: '',
  isOpened: false,
  active: false,
  title: 'Menu item',
  url: '#',
}

const Menu = props =>
  <Grid gutter="none" rows="fit-vertically" className="ds-menu">
    <H2 className="ds-menu__title ds-menu__title--main">{props.title}</H2>
    {props.children}
  </Grid>

Menu.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
}

Menu.defaultProps = {
  className: '',
  title: 'Menu',
}

export default Menu
export {
  MenuItem,
  MenuSubItem,
}
