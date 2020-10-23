import React from 'react'
import PropTypes from 'prop-types'
import './Navigation.scss'
import Grid from '@Layout/Grid/Grid'
import H1 from '@Typography/H1/H1'
import Image from '@Media/Image/Image'
import Hr from '@Gatsby/Pattern/Hr/Hr'
import Menu, { MenuItem, MenuSubItem } from '@Gatsby/Pattern/Menu/Menu'

const Navigation = props => {
  const currentUrl = typeof window !== 'undefined' ? window.location.pathname : ''

  return (
    <div className="ds-navigation">
      <Grid className="ds-navigation__contents">
        <H1>{ props.title }</H1>
        <Hr/>
        {
          props.menuList.map((menu, key) =>
            <Menu key={key} title={menu.title}>
              {
                (menu.children || []).map((menuItem, key) =>
                  <MenuItem key={key} title={menuItem.title} url={menuItem.url} isSelected={currentUrl.startsWith(menuItem.url)} isOpened={currentUrl.startsWith(menuItem.url)}>
                    {
                      (menuItem.children || []).map((menuSubItem, key) =>
                        <MenuSubItem key={key} title={menuSubItem.title} url={menuSubItem.url} isSelected={currentUrl.startsWith(menuSubItem.url)}/>,
                      )
                    }
                  </MenuItem>,
                )
              }
            </Menu>,
          )
        }
        <Hr/>
        <Image className="ds-navigation__logo" src={require('../../../../assets/logo/gruppo-maggioli.svg')}/>
      </Grid>
    </div>
  )
}

Navigation.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  menuList: PropTypes.any,
}

Navigation.defaultProps = {
  className: '',
  title: '',
}

export default Navigation
