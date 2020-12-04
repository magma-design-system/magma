import React from 'react'
import PropTypes from 'prop-types'
import './Navigation.scss'
import Grid from '@Layout/Grid/Grid'
import Row from '@Layout/Row/Row'
import InlineCode from '@UI/InlineCode/InlineCode'
import H1 from '@Typography/H1/H1'
import H5 from '@Typography/H5/H5'
import Caption from '@Typography/Caption/Caption'
import Image from '@Content/Image/Image'
import Hr from '@Gatsby/Pattern/Hr/Hr'
import Menu, { MenuItem, MenuSubItem } from '@Gatsby/Pattern/Menu/Menu'
import { getCurrentUrl } from '@Gatsby/Pattern/Navigation/menu'
import designSystemPackageData from '+Package/package.json'

const Navigation = props => {
  const currentUrl = getCurrentUrl()

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
                  <MenuItem key={key} title={menuItem.title} url={menuItem.url} active={currentUrl.startsWith(menuItem.url)} isOpened={currentUrl.startsWith(menuItem.url)}>
                    {
                      (menuItem.children || []).map((menuSubItem, key) =>
                        <MenuSubItem key={key} title={menuSubItem.title} url={menuSubItem.url} active={currentUrl.startsWith(menuSubItem.url)}/>,
                      )
                    }
                  </MenuItem>,
                )
              }
            </Menu>,
          )
        }
        <Hr/>
        <Row gutter="normal">
          <Image className="ds-navigation__logo" src={require('#Assets/brand/gruppo-maggioli/logo-gruppo-maggioli.svg')}/>
          <div>
            <H5>{designSystemPackageData.name}</H5>
            <Caption>Versione <InlineCode className="text-mono text-mono--hack">{designSystemPackageData.version}</InlineCode></Caption>
          </div>
        </Row>
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
