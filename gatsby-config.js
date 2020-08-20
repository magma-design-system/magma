const aliases = require('./import-aliases')

module.exports = {
  siteMetadata: {
    title: 'Design System documentation',
    description: 'Storybook stories rendered with GatsbyJs',
    author: 'Us',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-alias-imports',
      options: {
        aliases,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/doc/images`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'pages',
        path: `${__dirname}/src/doc/pages`,
      },
    },
    {
      resolve: 'gatsby-plugin-page-creator',
      options: {
        path: `${__dirname}/src/doc/pages`,
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    'gatsby-plugin-offline',
    'gatsby-plugin-sass',
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        defaultLayouts: {
          pages: `${__dirname}/src/doc/components/Layout/Page/Default/Default`,
          default: `${__dirname}/src/doc/components/Layout/Page/Default/Default`,
        },
        extensions: ['.mdx', '.md'],
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Gatsby Storybook Starter',
        short_name: 'Gatsby Storybook Starter',
        start_url: '/',
        background_color: '#ffffff',
        theme_color: '#744C9E',
        display: 'standalone',
        icon: 'src/doc/images/gatsby-icon.png', // This path is relative to the root of the site.
      },
    },
  ],
}
