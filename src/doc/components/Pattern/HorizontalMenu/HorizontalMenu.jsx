import React from 'react'
import PropTypes from 'prop-types'
import './HorizontalMenu.scss'

import { Link } from 'gatsby'
import HorizontalScroll from '@Layout/HorizontalScroll/HorizontalScroll'
import Grid from '@Layout/Grid/Grid'
import H5 from '@Typography/H5/H5'
import Hr from '@Gatsby/Pattern/Hr/Hr'

const HorizontalMenuItem = props =>
  <H5 htmlTag="div" className={`ds-horizontal-menu__item ${props.className}`}>{ props.children }</H5>

HorizontalMenuItem.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
}

HorizontalMenuItem.defaultProps = {
  active: false,
  className: '',
}

const HorizontalMenu = props =>
  <Grid className={`ds-horizontal-menu ${props.className}`}>
    <Hr className="ds-horizontal-menu__hr"/>
    <HorizontalScroll className="ds-horizontal-menu__list">
      <HorizontalMenuItem active={true}>Menu item 1</HorizontalMenuItem>
      <HorizontalMenuItem>Menu item 2</HorizontalMenuItem>
      <HorizontalMenuItem>Menu item 3</HorizontalMenuItem>
      <HorizontalMenuItem>Menu item 4</HorizontalMenuItem>
      <HorizontalMenuItem>Menu item 5</HorizontalMenuItem>
    </HorizontalScroll>
    <Hr/>
  </Grid>

HorizontalMenu.propTypes = {
  className: PropTypes.string,
}

HorizontalMenu.defaultProps = {
  className: '',
}

export default HorizontalMenu
