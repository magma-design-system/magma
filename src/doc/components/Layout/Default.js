import React from 'react'
import PropTypes from 'prop-types'
import { Link, StaticQuery, graphql } from 'gatsby'
import { MDXProvider } from '@mdx-js/react'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import Grid from '@Layout/Grid/Grid'
import Navigation from '@Gatsby/Pattern/Navigation/Navigation'
import Page from '@Gatsby/Page/Page'

const shortcodes = {
  Link,
  Grid,
}

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery($id: String) {
        site {
          siteMetadata {
            title
          }
        }
        mdx(id: { eq: $id }) {
          id
          body
          frontmatter {
            title
          }
        }
      }
    `}
    render={data =>
      <Page>
        <Grid template="design-system-page">
          <Navigation/>
          <div>
            <MDXProvider components={shortcodes}>
              <MDXRenderer>{data.mdx.body}</MDXRenderer>
            </MDXProvider>
          </div>
        </Grid>
      </Page>
    }
  />
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
