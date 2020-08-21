import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'
import H2 from '@Typography/H2/H2'
import H4 from '@Typography/H4/H4'
import H5 from '@Typography/H5/H5'
import './Menu.scss'

const MenuSubItem = props =>
  <div className={`ds-menu__child ${props.isSelected ? 'ds-menu__child--active' : ''}`}>
    <H5 className="ds-menu__title">
      {props.title}
    </H5>
  </div>

MenuSubItem.propTypes = {
  className: PropTypes.string,
  isSelected: PropTypes.bool,
  title: PropTypes.string,
}

MenuSubItem.defaultProps = {
  className: '',
  isSelected: false,
  title: 'Menu sub item',
}

const MenuItem = props =>
  <Grid gutter="none" fit={true} className={`ds-menu__item ${props.isSelected ? 'ds-menu__item--active' : ''}`}>
    <H4 className="ds-menu__title">
      {props.title}
    </H4>
    <Grid gutter="none" fit={true} className="ds-menu__list">
      {props.children}
    </Grid>
  </Grid>

MenuItem.propTypes = {
  className: PropTypes.string,
  isSelected: PropTypes.bool,
  title: PropTypes.string,
}

MenuItem.defaultProps = {
  className: '',
  isSelected: false,
  title: 'Menu item',
}

const Menu = props =>
  <Grid gutter="none" fit={true} className="ds-menu">
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
