import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import './Navigation.scss'
import Grid from '@Layout/Grid/Grid'
import H1 from '@Typography/H1/H1'
import Hr from '@Gatsby/Pattern/Hr/Hr'
import Menu, { MenuItem, MenuSubItem } from '@Gatsby/Pattern/Menu/Menu'

const Navigation = props => {
  const currentUrl = typeof window !== 'undefined' ? window.location.pathname : ''

  return (
    <div className="ds-navigation">
      <Grid className="ds-navigation__contents">
        <H1>{ props.title }</H1>
        {
          props.menuList.map((menu, key) =>
            <Fragment key={key}>
              <Hr/>
              <Menu title={menu.title}>
                {
                  (menu.children || []).map((menuItem, key) =>
                    <MenuItem key={key} title={menuItem.title} url={menuItem.url} isSelected={currentUrl === menuItem.url} isOpened={currentUrl.startsWith(menuItem.url)}>
                      {
                        (menuItem.children || []).map((menuSubItem, key) =>
                          <MenuSubItem key={key} title={menuSubItem.title} url={menuSubItem.url} isSelected={currentUrl === menuSubItem.url}/>,
                        )
                      }
                    </MenuItem>,
                  )
                }
              </Menu>
            </Fragment>,
          )
        }
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
