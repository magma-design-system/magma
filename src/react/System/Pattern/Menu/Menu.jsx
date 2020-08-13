import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'
import H1 from '@Typography/H1/H1'
import H5 from '@Typography/H5/H5'

const MenuItem = props =>
  <H5 className="ds-menu-item">
    {props.children}
  </H5>

const Menu = props =>
  <Grid gutter="none" fit={true} className="ds-menu">
    <H1>{props.title}</H1>
    {props.children}
  </Grid>

Menu.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
}

Menu.defaultProps = {
  className: '',
  title: 'Wip',
}

export default Menu
export {
  MenuItem,
}
