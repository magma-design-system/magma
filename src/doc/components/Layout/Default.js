import React from 'react'
import PropTypes from 'prop-types'
import { Link, StaticQuery, graphql } from 'gatsby'
import { MDXProvider } from '@mdx-js/react'
import Grid from '@Layout/Grid/Grid'
import H1 from '@Typography/H1/H1'
import Navigation from '@Gatsby/Pattern/Navigation/Navigation'
import Page from '@Gatsby/Page/Page'

const shortcodes = {
  Link,
  Grid,
}

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data =>
      <Page className="ds-layout">
        <Grid template="design-system-page">
          <Navigation/>
          <article className="ds-layout__contents">
            <H1>{data.site.siteMetadata.title}</H1>
            <div className="ds-layout__markdown">
              <MDXProvider components={shortcodes}>
                {children}
              </MDXProvider>
            </div>
          </article>
        </Grid>
      </Page>
    }
  />
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
