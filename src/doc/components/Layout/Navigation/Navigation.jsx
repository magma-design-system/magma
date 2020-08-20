import React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'
import './Navigation.scss'
import Grid from '@Layout/Grid/Grid'
import H1 from '@Typography/H1/H1'
import Hr from '@System/Layout/Hr/Hr'
import Menu, { MenuItem } from '@System/Pattern/Menu/Menu'

const query = graphql`
  query NavigationQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`

const Navigation = props =>
  <div className="ds-navigation">
    <Grid>
      <H1>{ props.title }</H1>
      <Hr/>
      <Grid columns="2">
        <Menu title="Doc">
          <MenuItem>Fondamenti</MenuItem>
          <MenuItem>Contenuti</MenuItem>
          <MenuItem>Design</MenuItem>
          <MenuItem>Componenti</MenuItem>
          <MenuItem>Pattern</MenuItem>
        </Menu>
        <Menu title="Use">
          <MenuItem>Installazione</MenuItem>
          <MenuItem>Configurazione</MenuItem>
          <MenuItem>integrazione</MenuItem>
        </Menu>
      </Grid>
      <Hr/>
      <Menu title="Design">
        <MenuItem>Colori</MenuItem>
        <MenuItem>Typography</MenuItem>
        <MenuItem>Illustrazioni</MenuItem>
        <MenuItem>Icone</MenuItem>
      </Menu>
      <Hr/>
      <Menu title="Dev">
        <MenuItem>Repository</MenuItem>
        <MenuItem>Roadmap</MenuItem>
        <MenuItem>Versione 0.0.3</MenuItem>
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
