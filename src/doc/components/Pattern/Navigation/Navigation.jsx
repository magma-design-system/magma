import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'
import './Navigation.scss'
import Grid from '@Layout/Grid/Grid'
import H1 from '@Typography/H1/H1'
import Hr from '@Gatsby/Pattern/Hr/Hr'
import Menu, { MenuItem, MenuSubItem } from '@Gatsby/Pattern/Menu/Menu'

const basePathTitles = {
  doc: 'Doc',
  use: 'Use',
  dev: 'Dev',
}

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

function updateMenu(menu, path) {
  let menuItem = menu.find(voce => voce.id === path[0])
  if (menuItem == null) {
    menuItem = { id: path[0] }
    menu.push(menuItem)
  }
  if (!menuItem.children) menuItem.children = []
  if (path.length > 1) menuItem.children = updateMenu(menuItem.children, path.slice(1))
  return menu
}

function findParent(menu, path) {
  const menuItem = menu.find(voce => voce.id === path[0])
  if (path.length > 1) return findParent(menuItem.children, path.slice(1))
  return menuItem
}

const Navigation = props => {
  let menu = []
  props.data.forEach(edge => {
    const link = edge.node.slug.endsWith('/') ? edge.node.slug.slice(0, -1) : edge.node.slug
    const path = link.split('/')
    if (path.length === 1 && path[0] === '') return

    menu = updateMenu(menu, path.slice(0, -1))
    const parent = findParent(menu, path.slice(0, -1))

    const menuItem = parent.children.find(voce => voce.id === path[path.length - 1])
    if (menuItem == null) {
      parent.children.push({
        id: path[path.length - 1],
        title: edge.node.frontmatter.title,
        url: `/${edge.node.slug}`,
      })
    } else {
      menuItem.title = edge.node.frontmatter.title
      menuItem.url = `/${edge.node.slug}`
    }
  })
  menu.forEach(voceMenu => (voceMenu.title = basePathTitles[voceMenu.id]))

  const currentUrl = typeof window !== 'undefined' ? window.location.pathname : ''

  return (
    <div className="ds-navigation">
      <Grid>
        <H1>{ props.title }</H1>
        {
          menu.map((menuItem, key) =>
            <Fragment key={key}>
              <Hr/>
              <Menu title={menuItem.title}>
                {
                  (menuItem.children || []).map((menuSubItem, key) =>
                    <MenuItem key={key} title={menuSubItem.title} url={menuSubItem.url} isSelected={currentUrl === menuSubItem.url} isOpened={currentUrl.startsWith(menuSubItem.url)}>
                      {
                        (menuSubItem.children || []).map((menuLastItem, key) =>
                          <MenuSubItem key={key} title={menuLastItem.title} url={menuLastItem.url} isSelected={currentUrl === menuLastItem.url}/>,
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
