import React from 'react'
import PropTypes from 'prop-types'
import { Link, StaticQuery, graphql } from 'gatsby'
import { MDXProvider } from '@mdx-js/react'
import Grid from '@Layout/Grid/Grid'
import H1 from '@Typography/H1/H1'
import Navigation from '@Gatsby/Pattern/Navigation/Navigation'
import Page from '@Gatsby/Page/Page'
import Hr from '@Gatsby/Pattern/Hr/Hr'
import './Layout.scss'
import { createMenuList, findMenuItem } from '../Pattern/Navigation/menu'

const shortcodes = {
  Link,
  Grid,
}

const Layout = ({ children }) => {
  return (
    <StaticQuery
      query={graphql`
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
      `}
      render={data => {
        const menuList = createMenuList(data.allMdx.edges)
        const currentUrl = typeof window !== 'undefined' ? window.location.pathname : ''
        const currentMenuItem = findMenuItem(menuList, currentUrl)

        return <Page className="ds-layout">
          <Grid template="design-system-page">
            <Navigation title={data.site.siteMetadata.title} menuList={menuList}/>
            <article className="ds-layout__contents">
              <Grid>
                <H1>{currentMenuItem.title}</H1>
                <Hr/>
                <div className="ds-layout__markdown">
                  <MDXProvider components={shortcodes}>
                    {children}
                  </MDXProvider>
                </div>
              </Grid>
            </article>
          </Grid>
        </Page>
      }}
    />
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
