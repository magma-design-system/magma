import React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'
import './Navigation.scss'
import Grid from '@Layout/Grid/Grid'
import H1 from '@Typography/H1/H1'
import Hr from '@Gatsby/Pattern/Hr/Hr'
import Menu, { MenuItem, MenuSubItem } from '@Gatsby/Pattern/Menu/Menu'

const query = graphql`
  query NavigationQuery {
    allMdx {
      edges {
        node {
          frontmatter {
            title
            date
          }
          slug
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
`

const Navigation = props =>
  <div className="ds-navigation">
    <Grid>
      <H1>{ props.title }</H1>
      <Hr/>
      <Menu title="Doc">
        <MenuItem title="Fondamenti"></MenuItem>
        <MenuItem title="Contenuti"></MenuItem>
        <MenuItem title="Design" isSelected={true}>
          <MenuSubItem title="Colori"/>
          <MenuSubItem title="Typography" isSelected={true}/>
          <MenuSubItem title="Illustrazioni"/>
        </MenuItem>
        <MenuItem title="Componenti"></MenuItem>
        <MenuItem title="Pattern"></MenuItem>
      </Menu>
      <Hr/>
      <Menu title="Use">
        <MenuItem title="Installazione"></MenuItem>
        <MenuItem title="Configurazione"></MenuItem>
        <MenuItem title="Implementazione"></MenuItem>
      </Menu>
    </Grid>
  </div>

Navigation.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  data: PropTypes.any,
}

Navigation.defaultProps = {
  className: '',
  title: '',
}

export default () =>
  <StaticQuery
    query={query}
    render={
      data => (<Navigation title={data.site.siteMetadata.title}/>)
    }
  />
