import React from 'react'
import PropTypes from 'prop-types'
import './HorizontalMenu.scss'

import { Link } from 'gatsby'
import HorizontalScroll from '@Layout/HorizontalScroll/HorizontalScroll'
import Grid from '@Layout/Grid/Grid'
import Icon from '@Design/Icon/Icon'
import Hr from '@Gatsby/Pattern/Hr/Hr'
import { getCurrentUrl } from '@Gatsby/Pattern/Navigation/menu'

const HorizontalMenuItem = props =>
  <div className="ds-horizontal-menu__item">
    <Link className={`ds-horizontal-menu__link text-primary text-primary--h5 ${props.active ? 'ds-horizontal-menu__link--active' : ''} ${props.className}`} to={props.url}>{ props.children }</Link>
  </div>

HorizontalMenuItem.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
  url: PropTypes.string,
}

HorizontalMenuItem.defaultProps = {
  active: false,
  className: '',
}

const HorizontalMenu = props => {
  const currentUrl = getCurrentUrl()

  return (<Grid gutter="none" className={`ds-horizontal-menu ${props.className}`}>
    <Hr className="ds-horizontal-menu__hr"/>
    <HorizontalScroll className="ds-horizontal-menu__list">
      <HorizontalMenuItem><Icon name="action-back"/></HorizontalMenuItem>
      {
        props.menuList.map((item, key) =>
          <HorizontalMenuItem key={key} url={item.url} active={currentUrl.startsWith(item.url)}>{item.title}</HorizontalMenuItem>,
        )
      }
    </HorizontalScroll>
    <Hr/>
  </Grid>)
}

HorizontalMenu.propTypes = {
  className: PropTypes.string,
  menuList: PropTypes.any,
}

HorizontalMenu.defaultProps = {
  className: '',
}

export default HorizontalMenu
