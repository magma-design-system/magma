import React, { useState, Fragment } from 'react'
import PropTypes from 'prop-types'
import { /* Link, */ StaticQuery, graphql } from 'gatsby'
import { MDXProvider } from '@mdx-js/react'
import './Layout.scss'
import { createMenuList, findMenuItem, getPageData, createMenuItemList, createHorizontalMenuList } from '@Gatsby/Pattern/Navigation/menu'
import metadataAuthors from '../../metadata/authors.json'
import metadataSources from '../../metadata/sources.json'

import Author from '@Content/Author/Author'
import BibliographyMLA from '@Content/Bibliography/BibliographyMLA'
import Button from '@UI/Button/Button'
import Code from '@UI/InlineCode/InlineCode'
import CodeBlock from '@Content/CodeBlock/CodeBlock'
import PackageInfo from '@Content/PackageInfo/PackageInfo'
import Grid from '@Layout/Grid/Grid'
import BenchmarkBar from '@Content/BenchmarkBar/BenchmarkBar'
import H1 from '@Typography/H1/H1'
import Caption from '@Typography/Caption/Caption'
import Detail from '@Typography/Detail/Detail'
import H2 from '@Typography/H2/H2'
import H3 from '@Typography/H3/H3'
import H4 from '@Typography/H4/H4'
import H5 from '@Typography/H5/H5'
import H6 from '@Typography/H6/H6'
import ExternalLink from '@UI/ExternalLink/ExternalLink'
import HorizontalMenu from '@Gatsby/Pattern/HorizontalMenu/HorizontalMenu'
import Hr, { HrLight } from '@Gatsby/Pattern/Hr/Hr'
import RoadmapChecklist from '@Gatsby/Pattern/Roadmap/RoadmapChecklist'
import Icon from '@Design/Icon/Icon'
import Image from '@Content/Image/Image'
import List, { ListItem } from '@UI/List/List'
import Navigation from '@Gatsby/Pattern/Navigation/Navigation'
import Page from '@Gatsby/Page/Page'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Quote from '@Content/Quote/Quote'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@UI/Table/Table'
import Usage, { UsageDo, UsageDont } from '@Content/Usage/Usage'

import { defineCustomElements as deckDeckGoHighlightElement } from '@deckdeckgo/highlight-code/dist/loader'

// https://www.gatsbyjs.com/plugins/gatsby-plugin-mdx/#mdxprovider

const shortcodes = {
  BibliographyMLA,
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
  BenchmarkBar,
  Image,
  ExternalLink,
  List,
  ListItem,
  PackageInfo,
  Paragraph,
  Quote,
  RoadmapChecklist,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Usage,
  UsageDo,
  UsageDont,
  a: ExternalLink,
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

const AuthorItem = authorData => {
  let author = null

  metadataAuthors.forEach(metadataAuthor => {
    if (author === null) {
      author = authorData.id === metadataAuthor.email ? metadataAuthor : null
    }
  })

  if (author === null) {
    return null
  }

  return <Author gravatar={`${author.email}?s=120&d=identicon`}>
    <H5>{author.name}</H5>
    {author.role && <Caption>{author.role}</Caption>}
  </Author>
}

const SourceItem = sourceData => {
  let source = null

  console.log(sourceData)

  metadataSources.forEach(metadataSource => {
    if (source === null) {
      source = sourceData.id.toString() === metadataSource.id.toString() ? metadataSource : null
    }
  })

  if (source === null) {
    return null
  }

  return <BibliographyMLA font="text-secondary text-secondary--detail" title={source.title} fullName={source.author} url={source.url}/>
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
                  author
                  date
                  source
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
        const menuItemList = createMenuItemList(menuList, currentUrl)
        const horizontalMenuItems = createHorizontalMenuList(menuItemList)
        const [isOpened, setMenuOpened] = useState(false)
        const publicationYear = new Date().getFullYear().toString()

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
                {horizontalMenuItems?.length > 0 && <HorizontalMenu className="ds-layout__actions" menuList={horizontalMenuItems}/>}
                <div className="ds-layout__markdown">
                  <MDXProvider components={shortcodes}>
                    {children}
                  </MDXProvider>
                </div>
                { page.frontmatter.author &&
                  <Grid gutter="xsmall">
                    <H5>Autori</H5>
                    <Grid template="auto-fill-authors">
                      { page.frontmatter.author.map(author =>
                        <AuthorItem id={author}/>,
                      )}
                    </Grid>
                  </Grid>
                }
                { page.frontmatter.source && <Hr/> }
                { page.frontmatter.source &&
                  <Grid gutter="none">
                    <H5>Riferimenti esterni</H5>
                    { page.frontmatter.source.map(source =>
                      <SourceItem id={source}/>,
                    )}
                  </Grid>
                }
                <Hr/>
                <footer className="ds-layout__footer">
                  <Paragraph><b>Design System</b> sviluppato dal reparto R&D.</Paragraph>
                  <Paragraph>Gruppo Maggioli © 2020{publicationYear !== '2020' ? `–${publicationYear}` : ''}.</Paragraph>
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
