import React from 'react'
import PropTypes from 'prop-types'
import { Link, StaticQuery, graphql } from 'gatsby'
import { MDXProvider } from '@mdx-js/react'
import './Layout.scss'
import Icon from '@Design/Icon/Icon'
import Grid from '@Layout/Grid/Grid'
import H1 from '@Typography/H1/H1'
import H2 from '@Typography/H2/H2'
import H3 from '@Typography/H3/H3'
import H4 from '@Typography/H4/H4'
import H5 from '@Typography/H5/H5'
import H6 from '@Typography/H6/H6'
import Paragraph from '@Typography/Paragraph/Paragraph'
import CodeSnippet from '@Element/CodeSnippet/CodeSnippet'
import Code from '@Element/Code/Code'
import List, { ListItem } from '@Element/List/List'
import Navigation from '@Gatsby/Pattern/Navigation/Navigation'
import Page from '@Gatsby/Page/Page'
import Hr, { HrLight } from '@Gatsby/Pattern/Hr/Hr'
import { createMenuList, findMenuItem } from '@Gatsby/Pattern/Navigation/menu'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@Layout/Table/Table'

const shortcodes = {
  Code,
  CodeSnippet,
  Grid,
  Icon,
  Link,
  List,
  ListItem,
  Paragraph,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  a: Link,
  code: Code,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  hr: HrLight,
  inlineCode: Code,
  li: ListItem,
  p: Paragraph,
  pre: CodeSnippet,
  ul: List,
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
            <Grid htmlTag="aside" className="ds-layout__aside">
              <Navigation title={data.site.siteMetadata.title} menuList={menuList}/>
            </Grid>
            <article className="ds-layout__article">
              <Grid className="ds-layout__contents">
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
