import React from 'react'
import PropTypes from 'prop-types'
import { Link, StaticQuery, graphql } from 'gatsby'
import { MDXProvider } from '@mdx-js/react'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import Grid from '@Layout/Grid/Grid'
import Navigation from '@Gatsby/Layout/Navigation/Navigation'

// const shortcodes = {
//   Link,
//   Grid,
// }
// const Page = ({ data: { mdx } }) =>
//   <Grid template="design-system-page">
//     <Navigation />
//     <div>
//       <MDXProvider components={shortcodes}>
//         <MDXRenderer>{mdx.body}</MDXRenderer>
//       </MDXProvider>
//     </div>
//   </Grid>
//
// Page.propTypes = {
//   data: PropTypes.any,
// }
//
// Page.defaultProps = {
//   data: {},
// }
//
// export default Page
//
// export const pageQuery = graphql`
//   query LayoutQuery($id: String) {
//     mdx(id: { eq: $id }) {
//       id
//       body
//       frontmatter {
//         title
//       }
//     }
//   }
// `

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
    render={data => {
      console.log(data)
      return (
        <>
          <Grid template="design-system-page">
            <Navigation/>
            <div
              style={{
                margin: '0 auto',
                maxWidth: 960,
                padding: '0px 1.0875rem 1.45rem',
                paddingTop: 0,
              }}
            >
              {children}
            </div>
          </Grid>
        </>
      )
    }}
  />
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
