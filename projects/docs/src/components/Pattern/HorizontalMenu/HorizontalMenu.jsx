import React from 'react'
import PropTypes from 'prop-types'
import './HorizontalMenu.scss'

import { Link } from 'gatsby'
import HorizontalScroll from '@Layout/HorizontalScroll/HorizontalScroll'
import Grid from '@Layout/Grid/Grid'
import Hr from '@Gatsby/Pattern/Hr/Hr'
import { getCurrentUrl } from '@Gatsby/Pattern/Navigation/menu'

const HorizontalMenuItem = props =>
  <div className={`ds-horizontal-menu__item ${props.disabled ? 'ds-horizontal-menu__item--disabled' : ''}`}>
    <Link className={`ds-horizontal-menu__link text-primary text-primary--h5 ${props.disabled ? 'pl-0 pr-0' : ''} ${props.active ? 'ds-horizontal-menu__link--active' : ''} ${props.className}`} to={props.url}>{ props.children }</Link>
  </div>

HorizontalMenuItem.propTypes = {
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  url: PropTypes.string,
}

HorizontalMenuItem.defaultProps = {
  active: false,
  disabled: false,
  className: '',
}

const HorizontalMenu = props => {
  const currentUrl = getCurrentUrl()

  return <Grid gutter="none" className={`ds-horizontal-menu ${props.className}`}>
    <Hr className="ds-horizontal-menu__hr"/>
    <HorizontalScroll outerMargin="none" className="ds-horizontal-menu__list">
      <HorizontalMenuItem>Page name</HorizontalMenuItem>
      <HorizontalMenuItem disabled>/</HorizontalMenuItem>
      {
        props.menuList.map((item, key) =>
          <HorizontalMenuItem key={key} url={item.url} active={currentUrl.startsWith(item.url)}>{item.title}</HorizontalMenuItem>,
        )
      }
    </HorizontalScroll>
    <Hr/>
  </Grid>
}

HorizontalMenu.propTypes = {
  className: PropTypes.string,
  menuList: PropTypes.any,
}

HorizontalMenu.defaultProps = {
  className: '',
}

export default HorizontalMenu
