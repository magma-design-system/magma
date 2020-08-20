import React from 'react'
import PropTypes from 'prop-types'
import { Link, graphql } from 'gatsby'
import { MDXProvider } from '@mdx-js/react'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import Grid from '@Layout/Grid/Grid'
import Navigation from '@Gatsby/Layout/Navigation/Navigation'

const shortcodes = {
  Link,
  Grid,
}
const Page = ({ data: { mdx } }) =>
  <Grid template="design-system-page">
    <Navigation />
    <div>
      <MDXProvider components={shortcodes}>
        <MDXRenderer>{mdx.body}</MDXRenderer>
      </MDXProvider>
    </div>
  </Grid>

Page.propTypes = {
  data: PropTypes.any,
}

Page.defaultProps = {
  data: {},
}

export default Page

export const pageQuery = graphql`
  query LayoutQuery($id: String) {
    mdx(id: { eq: $id }) {
      id
      body
      frontmatter {
        title
      }
    }
  }
`
