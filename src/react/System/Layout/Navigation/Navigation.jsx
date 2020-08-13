import React from 'react'
import './Navigation.scss'
import Grid from '@Layout/Grid/Grid'
import H1 from '@Typography/H1/H1'
import Hr from '@System/Layout/Hr/Hr'
import Menu, { MenuItem } from '@System/Pattern/Menu/Menu'

const Navigation = props =>
  <div className="ds-navigation">
    <Grid>
      <H1>Maggioli Design System</H1>
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
    </Grid>
  </div>

export default Navigation
