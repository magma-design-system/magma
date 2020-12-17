const aliases = require('./import-aliases')
const path = require('path')

module.exports = {
  siteMetadata: {
    title: 'Maggioli Design System',
    description: 'Maggioli Design System è uno strumento nato per condividere una unica visione di progettazione condivisa tra tutti gli esperti di dominio aziendali. Ciò permette di offrire una UX unica, condivisa tra i prodotti che saranno coerenti allo stile dell’azienda.',
    author: 'Maggioli Informatica, R&D department',
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
        path: path.resolve(__dirname, '/src/doc/images'),
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'pages',
        path: path.resolve(__dirname, '/src/doc/pages'),
      },
    },
    {
      resolve: 'gatsby-plugin-page-creator',
      options: {
        path: path.resolve(__dirname, '/src/doc/pages'),
      },
    },
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-highlight-code',
            options: {
              terminal: 'carbon',
              theme: 'blackboard',
            },
          },
        ],
      },
    },
    'gatsby-plugin-sharp',
    'gatsby-plugin-offline',
    'gatsby-plugin-sass',
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        defaultLayouts: {
          pages: path.resolve(__dirname, '/src/doc/components/Layout/Default'),
          default: path.resolve(__dirname, '/src/doc/components/Layout/Default'),
        },
        extensions: ['.mdx', '.md'],
        gatsbyRemarkPlugins: [
          {
            resolve: 'gatsby-remark-highlight-code',
          },
        ],
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
