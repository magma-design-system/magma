import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
      <Image />
    </div>
    <Link to="/01-Palette.stories/">01-Palette.stories</Link> <br />
    <Link to="/02-Usage.stories/">02-Usage.stories</Link> <br />
    <Link to="/03-Accessibility.stories/">03-Accessibility.stories</Link> <br />
    <Link to="/04-NamingConventions.stories/">04-NamingConventions.stories</Link> <br />
    <Link to="/using-typescript/">Go to "Using TypeScript"</Link>
  </Layout>
)

export default IndexPage
