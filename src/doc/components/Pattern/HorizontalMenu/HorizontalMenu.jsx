import React from 'react'
import PropTypes from 'prop-types'
import './HorizontalMenu.scss'

import { Link } from 'gatsby'
import HorizontalScroll from '@Layout/HorizontalScroll/HorizontalScroll'
import Grid from '@Layout/Grid/Grid'
import Hr from '@Gatsby/Pattern/Hr/Hr'

const HorizontalMenuItem = props =>
  <Link className={`ds-horizontal-menu__item text-primary text-primary--h5 ${props.className}`} href={props.url}>{ props.children }</Link>

HorizontalMenuItem.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
  url: PropTypes.string,
}

HorizontalMenuItem.defaultProps = {
  active: false,
  className: '',
}

const HorizontalMenu = props =>
  <Grid className={`ds-horizontal-menu ${props.className}`}>
    <Hr className="ds-horizontal-menu__hr"/>
    <HorizontalScroll className="ds-horizontal-menu__list">
      {
        props.menuList.map((item, key) =>
          <HorizontalMenuItem key={key} url={item.url}>{ item.title }</HorizontalMenuItem>,
        )
      }
    </HorizontalScroll>
    <Hr/>
  </Grid>

HorizontalMenu.propTypes = {
  className: PropTypes.string,
  menuList: PropTypes.any,
}

HorizontalMenu.defaultProps = {
  className: '',
}

export default HorizontalMenu
