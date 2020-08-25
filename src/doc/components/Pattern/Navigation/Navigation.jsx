import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'
import './Navigation.scss'
import Grid from '@Layout/Grid/Grid'
import H1 from '@Typography/H1/H1'
import Hr from '@Gatsby/Pattern/Hr/Hr'
import Menu, { MenuItem, MenuSubItem } from '@Gatsby/Pattern/Menu/Menu'
import { createMenuList } from './menu'

const query = graphql`
  query NavigationQuery {
    allMdx {
      edges {
        node {
          frontmatter {
            title
            date
          }
          slug
          timeToRead
          tableOfContents
        }
      }
    }
    site {
      siteMetadata {
        title
        description
        author
      }
    }
  }
`

const Navigation = props => {
  const menuList = createMenuList(props.data)
  const currentUrl = typeof window !== 'undefined' ? window.location.pathname : ''

  return (
    <div className="ds-navigation">
      <Grid>
        <H1>{ props.title }</H1>
        {
          menuList.map((menu, key) =>
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
  data: PropTypes.any,
}

Navigation.defaultProps = {
  className: '',
  title: '',
}

export default () =>
  <StaticQuery
    query={query}
    render={
      data => (<Navigation title={data.site.siteMetadata.title} data={data.allMdx.edges}/>)
    }
  />
