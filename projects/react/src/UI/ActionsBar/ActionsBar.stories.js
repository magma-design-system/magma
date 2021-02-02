import React from 'react'

import ActionsBar, { ActionsBarItems } from '@UI/ActionsBar/ActionsBar'
import H3 from '@Typography/H3/H3'
import H4 from '@Typography/H4/H4'
import Detail from '@Typography/Detail/Detail'
import Grid from '@Layout/Grid/Grid'
import Button from '@UI/Button/Button'

export default {
  title: 'UI/ActionsBar',
  component: ActionsBar,
}

export const basicUsage = () =>
  <ActionsBar>
    <Grid gutter="none">
      <H4>4 items selected</H4>
      <Detail className="color-adjust-tone-08">You are doing this action beacouse you can.</Detail>
    </Grid>
    <ActionsBarItems>
      <Button variant="error" icon="crud-delete">Cancella</Button>
      <Button variant="warning" icon="crud-cancel">Annulla</Button>
      <Button variant="success" icon="crud-edit">Modifica</Button>
    </ActionsBarItems>
  </ActionsBar>

export const positionCenter = () =>
  <ActionsBar position="center">
    <H3>4 items selected</H3>
    <ActionsBarItems>
      <Button variant="error" icon="crud-delete">Cancella</Button>
      <Button variant="warning" icon="crud-cancel">Annulla</Button>
      <Button variant="success" icon="crud-edit">Modifica</Button>
    </ActionsBarItems>
  </ActionsBar>

export const positionLeft = () =>
  <ActionsBar position="left">
    <Grid gutter="none">
      <H4>4 items selected</H4>
      <Detail className="color-adjust-tone-08">You are doing this action beacouse you can.</Detail>
    </Grid>
    <ActionsBarItems>
      <Button variant="error" icon="crud-delete">Cancella</Button>
      <Button variant="warning" icon="crud-cancel">Annulla</Button>
      <Button variant="success" icon="crud-edit">Modifica</Button>
    </ActionsBarItems>
  </ActionsBar>
