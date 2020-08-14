import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'
import H2 from '@Typography/H2/H2'
import Paragraph from '@Typography/Paragraph/Paragraph'

const MenuItem = props =>
  <Paragraph className="ds-menu-item">
    {props.children}
  </Paragraph>

const Menu = props =>
  <Grid gutter="none" fit={true} className="ds-menu">
    <H2>{props.title}</H2>
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
