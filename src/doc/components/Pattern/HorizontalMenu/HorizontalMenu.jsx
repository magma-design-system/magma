import React from 'react'
import PropTypes from 'prop-types'
import './HorizontalMenu.scss'

import { Link } from 'gatsby'
import HorizontalScroll from '@Layout/HorizontalScroll/HorizontalScroll'
import Grid from '@Layout/Grid/Grid'
import H5 from '@Typography/H5/H5'
import Hr from '@Gatsby/Pattern/Hr/Hr'

const HorizontalMenu = props =>
  <Grid className={`ds-horizontal-menu ${props.className}`}>
    <HorizontalScroll className="ds-horizontal-menu__list">
      <H5><Link>Menu item 1</Link></H5>
      <H5><Link>Menu item 2</Link></H5>
      <H5><Link>Menu item 4</Link></H5>
      <H5><Link>Menu item 5</Link></H5>
    </HorizontalScroll>
    <Hr className="ds-horizontal-menu__hr"/>
  </Grid>

HorizontalMenu.propTypes = {
  className: PropTypes.string,
}

HorizontalMenu.defaultProps = {
  className: '',
}

export default HorizontalMenu
