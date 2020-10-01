import React from 'react'
import faker from 'faker'

import Menu, { MenuItem, MenuItemTitle, MenuItemAction } from '@Backend/Element/Menu/Menu'
import Page, { PageHeader, PageFooter } from '@Backend/Layout/Page/Page'
import InputText from '@Backend/Form/Input/InputText'
import Switch from '@Backend/Form/Switch/Switch'
import Button from '@Backend/Form/Button/Button'
import Grid from '@Layout/Grid/Grid'
import Hr from '@Backend/Element/Hr/Hr'
faker.locale = 'it'

export default {
  title: 'Backend/Layout/Page',
  component: Page,
  decorators: [Story => <Story/>],
}

export const basicUsage = () =>
  <Page
    title="Approfondimenti"
    header={
      <PageHeader>
        Libro
      </PageHeader>
    }
    menu={
      <Menu>
        <MenuItem>
          <MenuItemTitle icon="book">Libri</MenuItemTitle>
          <MenuItemAction icon="list" to="/edit">Gestisci</MenuItemAction>
          <MenuItemAction active={true} icon="add" to="/new">Aggiungi</MenuItemAction>
        </MenuItem>
        <MenuItem>
          <MenuItemTitle icon="code">Codici</MenuItemTitle>
          <MenuItemAction icon="list" to="/edit">Gestisci</MenuItemAction>
          <MenuItemAction icon="add" to="/new">Genera</MenuItemAction>
        </MenuItem>
        <MenuItem>
          <MenuItemTitle icon="users">Utenti</MenuItemTitle>
          <MenuItemAction icon="list" to="/edit">Gestisci</MenuItemAction>
          <MenuItemAction icon="add" to="/new">Aggiungi</MenuItemAction>
        </MenuItem>
      </Menu>
    }
    footer={
      <PageFooter email="pippo@gmail.com"/>
    }>
    <Grid columns="3">
      <InputText label="Titolo mega lungo da paura" placeholder="Ciaone" icon="shipping" />
      <InputText label="Descrizione" icon="uploadPhoto" filled={true} />
      <InputText label="Descrizione" filled={true} />
      <InputText label="Descrizione" />
      <Switch sChecked={true}>Questo libro ha codici per approfondimenti</Switch>
      <Button>Salva</Button>
    </Grid>
    <Hr/>
  </Page>
