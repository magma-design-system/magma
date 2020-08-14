import React from 'react'
import PropTypes from 'prop-types'
import { MDXProvider } from '@mdx-js/react'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import { Link, graphql } from 'gatsby'
import Page from '@System/Page/Page'
import Grid from '@Layout/Grid/Grid'
import Navigation from '@System/Layout/Navigation/Navigation'
const shortcodes = { Link } // Provide common components here

const LayoutMDX = ({ data: { mdx } }) =>
  <Page>
    <Grid template="design-system-page">
      <Navigation />
      <MDXProvider components={shortcodes}>
        <MDXRenderer>{mdx.body}</MDXRenderer>
      </MDXProvider>
    </Grid>
  </Page>

LayoutMDX.propTypes = {
  data: PropTypes.any,
}

LayoutMDX.defaultProps = {
  data: '',
}

export default LayoutMDX
export const pageQuery = graphql`
  query BlogPostQuery($id: String) {
    mdx(id: { eq: $id }) {
      id
      body
      frontmatter {
        title
      }
    }
  }
`
