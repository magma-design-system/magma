import React from 'react'
import PropTypes from 'prop-types'
import './Navigation.scss'
import Caption from '@Typography/Caption/Caption'
import ExternalLink from '@UI/ExternalLink/ExternalLink'
import Grid from '@Layout/Grid/Grid'
import H1 from '@Typography/H1/H1'
import Hr from '@Gatsby/Pattern/Hr/Hr'
import Icon from '@Design/Icon/Icon'
import InlineCode from '@UI/InlineCode/InlineCode'
import Menu, { MenuItem, MenuSubItem } from '@Gatsby/Pattern/Menu/Menu'
import Row from '@Layout/Row/Row'
import { Link } from 'gatsby'
import { getCurrentUrl } from '@Gatsby/Pattern/Navigation/menu'
import designSystemPackageData from '+Docs/package.json'

import storybookLogo from './storybook-logo.svg'
import maggioliLogo from '@maggioli-design-system/identity/dist/gruppo-maggioli/logo-gruppo-maggioli.svg'

const Navigation = props => {
  const currentUrl = getCurrentUrl()

  return (
    <div className="ds-navigation">
      <Grid className="ds-navigation__contents">
        <Link to="/" className="ds-navigation__title"><H1>{ props.title }</H1></Link>
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
        <Grid gutter="xsmall">
          <Row gutter="xsmall">
            <Icon image={storybookLogo}/>
            <Caption><ExternalLink href="/storybook">Vai alla Pattern Library</ExternalLink></Caption>
          </Row>
          <Row gutter="xsmall">
            <Icon image={maggioliLogo}/>
            <Caption><ExternalLink href={designSystemPackageData.repository.url}>{designSystemPackageData.name}</ExternalLink> <InlineCode className="text-mono text-mono--hack">{designSystemPackageData.version}</InlineCode></Caption>
          </Row>
        </Grid>
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
