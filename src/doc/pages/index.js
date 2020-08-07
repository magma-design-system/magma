import React from 'react'
import { graphql, Link } from 'gatsby'

import Layout from '../components/layout'
import Image from '../components/image'
import SEO from '../components/seo'
import Grid from '@Layout/Grid/Grid'

const IndexPage = ({ data }) => {
  const { edges: posts } = data.allMdx
  return (
    <Layout>
      <SEO title="Home" />
      <h1>Hi people</h1>
      <Grid columns="2">
        <p>Welcome to your new Gatsby site.</p>
        <p>Now go build something great.</p>
      </Grid>
      <div style={{
        maxWidth: '300px',
        marginBottom: '20px',
      }}>
        <Image />
      </div>
      <ul>
        {posts.map(({ node: post }) => (
          <li key={post.id}>
            <Link to={post.fields.slug}>
              <span>{post.frontmatter.title}</span>
            </Link>
            <p>{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export const pageQuery = graphql`
  query blogIndex {
    allMdx {
      edges {
        node {
          id
          excerpt
          frontmatter {
            title
          }
          fields {
            slug
          }
        }
      }
    }
  }
`

export default IndexPage
