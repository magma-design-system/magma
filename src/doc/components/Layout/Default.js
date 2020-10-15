import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { /* Link, */ StaticQuery, graphql } from 'gatsby'
import { MDXProvider } from '@mdx-js/react'
import './Layout.scss'
import { createMenuList, findMenuItem, getPageData } from '@Gatsby/Pattern/Navigation/menu'

import Bibliography from '@Content/Bibliography/Bibliography'
import Button from '@Element/Button/Button'
import Code from '@Element/Code/Code'
import CodeBlock from '@Element/CodeBlock/CodeBlock'
import Grid from '@Layout/Grid/Grid'
import InfoBar from '@Content/InfoBar/InfoBar'
import H1 from '@Typography/H1/H1'
import Caption from '@Typography/Caption/Caption'
import Detail from '@Typography/Detail/Detail'
import H2 from '@Typography/H2/H2'
import H3 from '@Typography/H3/H3'
import H4 from '@Typography/H4/H4'
import H5 from '@Typography/H5/H5'
import H6 from '@Typography/H6/H6'
import Link from '@Element/Link/Link'
import HorizontalMenu from '@Gatsby/Pattern/HorizontalMenu/HorizontalMenu'
import Hr, { HrLight } from '@Gatsby/Pattern/Hr/Hr'
import Icon from '@Design/Icon/Icon'
import Image from '@Media/Image/Image'
import List, { ListItem } from '@Element/List/List'
import Navigation from '@Gatsby/Pattern/Navigation/Navigation'
import Page from '@Gatsby/Page/Page'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Quote from '@Content/Quote/Quote'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@Layout/Table/Table'
import Usage, { UsageDo, UsageDont } from '@Content/Usage/Usage'

import { defineCustomElements as deckDeckGoHighlightElement } from '@deckdeckgo/highlight-code/dist/loader'

// https://www.gatsbyjs.com/plugins/gatsby-plugin-mdx/#mdxprovider

const shortcodes = {
  Button,
  Caption,
  Detail,
  Code,
  CodeBlock,
  Grid,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Hr,
  HrLight,
  Icon,
  InfoBar,
  Image,
  Link,
  List,
  ListItem,
  Paragraph,
  Quote,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Usage,
  UsageDo,
  UsageDont,
  a: Link,
  blockquote: Quote,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  hr: HrLight,
  img: Image,
  inlineCode: Code,
  li: ListItem,
  p: Paragraph,
  ul: List,
}

const Layout = ({ children }) => {
  deckDeckGoHighlightElement()

  return (
    <StaticQuery
      query={graphql`
        query NavigationQuery {
          allMdx {
            edges {
              node {
                frontmatter {
                  date
                  title
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
        const sideMenuList = menuList.filter(menu => menu.id !== '')
        const currentUrl = typeof window !== 'undefined' ? window.location.pathname : ''
        const currentMenuItem = findMenuItem(menuList, currentUrl)
        const page = getPageData(data.allMdx.edges, currentUrl)
        // const horizontalMenuItems = [currentMenuItem, ...currentMenuItem.children]
        const horizontalMenuItems = currentMenuItem.children
        const [isOpened, setMenuOpened] = useState(false)
        const pubblicationYear = new Date().getFullYear().toString()

        return <Page className="ds-layout">
          <div className={`ds-layout__switch ${isOpened ? 'ds-layout__switch--is-active' : ''}`} onClick={() => setMenuOpened(!isOpened)}>
            <Icon name="menu-main" className="ds-layout__switch-icon ds-layout__switch-icon--menu"/>
            <Icon name="action-close" className="ds-layout__switch-icon ds-layout__switch-icon--close"/>
          </div>
          <main>
            <div htmlTag="aside" className={`ds-layout__aside ${isOpened ? 'ds-layout__aside--is-active' : ''}`}>
              <Navigation title={data.site.siteMetadata.title} menuList={sideMenuList}/>
            </div>
            <article className={`ds-layout__article ${isOpened ? 'ds-layout__article--is-not-scrolling' : ''}`}>
              <Grid className="ds-layout__contents">
                <H1 className="ds-layout__title">{currentMenuItem.title}</H1>
                {horizontalMenuItems && <HorizontalMenu className="ds-layout__actions" menuList={horizontalMenuItems}/>}
                <div className="ds-layout__markdown">
                  <MDXProvider components={shortcodes}>
                    {children}
                  </MDXProvider>
                </div>
                {page.frontmatter.source && <Bibliography format="mla" title={page.frontmatter.source.title} site={page.frontmatter.source.site} url={page.frontmatter.source.url}/> }
                <Hr/>
                <footer className="ds-layout__footer">
                  <Paragraph><b>Design System</b> sviluppato dal reparto R&D.</Paragraph>
                  <Paragraph>Gruppo Maggioli © 2020{pubblicationYear !== '2020' ? `–${pubblicationYear}` : ''}.</Paragraph>
                  <Image className="ds-layout__footer-logo" src={require('../../../assets/logo/gruppo-maggioli.svg')}/>
                </footer>
              </Grid>
            </article>
          </main>
        </Page>
      }}
    />
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
