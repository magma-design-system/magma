import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { /* Link, */ StaticQuery, graphql } from 'gatsby'
import { MDXProvider } from '@mdx-js/react'
import './Layout.scss'
import { createMenuList, findMenuItem, getPageData, createMenuItemList, createHorizontalMenuList, getCurrentUrl } from '@Gatsby/Pattern/Navigation/menu'
import metadataAuthors from '../../metadata/authors.json'
import metadataSources from '../../metadata/sources.json'

import TimeAgo from 'react-timeago'
import frenchStrings from 'react-timeago/lib/language-strings/it'
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'

import AssetPreviewer from '@Gatsby/Pattern/AssetPreviewer/AssetPreviewer'
import SectionMenu, { SectionMenuItem } from '@Gatsby/Pattern/SectionMenu/SectionMenu'
import Author from '@Content/Author/Author'
import BenchmarkBar from '@Content/BenchmarkBar/BenchmarkBar'
import BibliographyMLA from '@Content/Bibliography/BibliographyMLA'
import Button from '@UI/Button/Button'
import Caption from '@Typography/Caption/Caption'
import Action from '@Typography/Action/Action'
import InlineCode from '@UI/InlineCode/InlineCode'
import CodeBlock from '@Content/CodeBlock/CodeBlock'
import Detail from '@Typography/Detail/Detail'
import Download from '@UI/Download/Download'
import ExternalLink from '@UI/ExternalLink/ExternalLink'
import Banner from '@UI/Banner/Banner'
import Grid from '@Layout/Grid/Grid'
import Row from '@Layout/Row/Row'
import H1 from '@Typography/H1/H1'
import H2 from '@Typography/H2/H2'
import H3 from '@Typography/H3/H3'
import H4 from '@Typography/H4/H4'
import H5 from '@Typography/H5/H5'
import H6 from '@Typography/H6/H6'
import Code from '@Typography/Code/Code'
import Hack from '@Typography/Hack/Hack'
import Overline from '@Typography/Overline/Overline'
import LabelCaption from '@Typography/LabelCaption/LabelCaption'
import LabelDetail from '@Typography/LabelDetail/LabelDetail'
import LabelParagraph from '@Typography/LabelParagraph/LabelParagraph'
import HorizontalMenu from '@Gatsby/Pattern/HorizontalMenu/HorizontalMenu'
// import Hr, { HrLight } from '@Gatsby/Pattern/Hr/Hr'
import Hr from '@UI/Hr/Hr'
import Icon from '@Design/Icon/Icon'
import Image from '@Content/Image/Image'
import UList, { UListItem } from '@UI/UList/UList'
import Navigation from '@Gatsby/Pattern/Navigation/Navigation'
import Cover from '@Gatsby/Pattern/Cover/Cover'
import PackageInfo from '@Content/PackageInfo/PackageInfo'
import Page from '@Gatsby/Page/Page'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Quote from '@Content/Quote/Quote'
import RoadmapChecklist, { RoadmapChecklistTasks } from '@Gatsby/Pattern/Roadmap/RoadmapChecklist'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@UI/Table/Table'
import Tag from '@UI/Tag/Tag'
import Usage, { UsageDo, UsageDont } from '@Content/Usage/Usage'

import logoMaggioli from '@maggioli-design-system/identity/dist/gruppo-maggioli/logo-gruppo-maggioli.svg'

import { defineCustomElements as deckDeckGoHighlightElement } from '@deckdeckgo/highlight-code/dist/loader'

const formatter = buildFormatter(frenchStrings)

const shortcodes = {
  Action,
  AssetPreviewer,
  Banner,
  BenchmarkBar,
  BibliographyMLA,
  Button,
  Caption,
  Code,
  CodeBlock,
  Cover,
  Detail,
  Download,
  ExternalLink,
  Grid,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Hack,
  Hr,
  Icon,
  Image,
  InlineCode,
  LabelCaption,
  LabelDetail,
  LabelParagraph,
  Overline,
  PackageInfo,
  Paragraph,
  Quote,
  RoadmapChecklist,
  RoadmapChecklistTasks,
  Row,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Tag,
  UList,
  UListItem,
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
  hr: Hr,
  img: Image,
  inlineCode: InlineCode,
  li: UListItem,
  p: Paragraph,
  ul: UList,
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
        query DefaultTemplateNavigationQuery {
          allMdx {
            edges {
              node {
                frontmatter {
                  author
                  date
                  lastEdit
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
        const currentUrl = getCurrentUrl()
        const menuList = createMenuList(data.allMdx.edges)
        const currentUrlEndingWithSlash = currentUrl[currentUrl.length - 1] === '/' ? currentUrl : `${currentUrl}/`
        const sideMenuList = menuList
          .filter(menu => menu.id !== '') // Filtering home page
          .find(menu => currentUrlEndingWithSlash.startsWith(menu.url)) // Searching the first navigation level
          ?.children
        const currentMenuItem = findMenuItem(menuList, currentUrl)
        const page = getPageData(data.allMdx.edges, currentUrl)
        const menuItemList = createMenuItemList(menuList, currentUrl)
        const horizontalMenuItems = createHorizontalMenuList(menuItemList)
        const [isOpened, setMenuOpened] = useState(false)
        const publicationYear = new Date().getFullYear().toString()

        return <Page className="ds-layout">
          <Helmet>
            <meta charSet="utf-8" />
            <title>{currentMenuItem.title ? currentMenuItem.title : data.site.siteMetadata.title}</title>
            <meta http-equiv="x-ua-compatible" content="ie=edge"></meta>
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"></meta>
            <link rel="canonical" href="http://designsystem.maggiolicloud.it/" />
          </Helmet>
          <div className={`ds-layout__switch ${isOpened ? 'ds-layout__switch--is-active' : ''}`} onClick={() => setMenuOpened(!isOpened)}>
            <Icon name="menu-main" size="large" className="ds-layout__switch-icon ds-layout__switch-icon--menu"/>
            <Icon name="action-close" size="large" className="ds-layout__switch-icon ds-layout__switch-icon--close"/>
          </div>
          <main className="ds-layout__main">
            <aside className={`ds-layout__aside ${isOpened ? 'ds-layout__aside--is-active' : ''}`}>
              <div className="ds-layout__aside-content">
                <Navigation title={data.site.siteMetadata.title} menuList={sideMenuList}/>
              </div>
            </aside>
            <article className={`ds-layout__article ${isOpened ? 'ds-layout__article--is-not-scrolling' : ''}`}>
              <SectionMenu>
                <SectionMenuItem><H3>News</H3></SectionMenuItem>
                <SectionMenuItem active><H3>Governance</H3></SectionMenuItem>
                <SectionMenuItem><H3>Content</H3></SectionMenuItem>
                <SectionMenuItem><H3>Design</H3></SectionMenuItem>
                <SectionMenuItem><H3>Develop</H3></SectionMenuItem>
                <Icon className="ml-auto" name="data-search"/>
              </SectionMenu>
              <Grid className="ds-layout__contents mt-10 shadow rounded-3xl" rows="fit-vertically">
                <H1 className="ds-layout__title">{currentMenuItem.title}</H1>
                {horizontalMenuItems?.length > 0 && <HorizontalMenu className="ds-layout__actions" menuList={horizontalMenuItems}/>}
                <Grid className="ds-layout__markdown">
                  <MDXProvider components={shortcodes}>
                    {children}
                  </MDXProvider>
                </Grid>
                <Hr spacing="xsmall" className="bg-adjust-tone-18"/>
                {/* page.frontmatter.author &&
                  <Grid gutter="xsmall">
                    <H5>{page.frontmatter.author.length === 1 ? 'Autore' : 'Autori'}</H5>
                    <Grid template="auto-fill-authors">
                      { page.frontmatter.author.map((author, key) =>
                        <AuthorItem key={key} id={author}/>,
                      )}
                    </Grid>
                  </Grid>
                */}
                <Grid template="auto-fill-large">
                  { page.frontmatter.date &&
                    <Grid gutter="none">
                      <H5>Data di pubblicazione</H5>
                      <TimeAgo className="ds-layout__pubblication-date text-secondary text-secondary--detail" date={page.frontmatter.date} formatter={formatter} />
                    </Grid>
                  }
                  { page.frontmatter.lastEdit &&
                    <Grid gutter="none">
                      <H5>Ultima modifica</H5>
                      <TimeAgo className="ds-layout__pubblication-date text-secondary text-secondary--detail" date={page.frontmatter.lastEdit} formatter={formatter} />
                    </Grid>
                  }
                </Grid>
                { page.frontmatter.source && <Hr spacing="xsmall" className="bg-adjust-tone-18"/> }
                { page.frontmatter.source &&
                  <Grid gutter="none">
                    <H5>Riferimenti esterni</H5>
                    { page.frontmatter.source.map((source, key) =>
                      <SourceItem key={key} id={source}/>,
                    )}
                  </Grid>
                }
              </Grid>
              <Row htmlTag="footer" gutter="normal" align="flex-start" className="ds-layout__footer">
                <Image className="ds-layout__footer-logo" src={logoMaggioli}/>
                <div>
                  <Detail><b>Design System</b> sviluppato con ❤️ &nbsp;dal reparto R&D e tutti i supporter all'interno di Maggioli.</Detail>
                  <Caption>Gruppo Maggioli © 2020{publicationYear !== '2020' ? `–${publicationYear}` : ''}.</Caption>
                </div>
              </Row>
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
