import React from 'react'
import faker from 'faker'

import Menu, { MenuItem, MenuItemTitle, MenuItemAction } from '@Backend/Element/Menu/Menu'
import Page, { PageHeader, PageFooter } from '@Backend/Layout/Page/Page'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@Layout/Table/Table'
import TableAlternate, { TableAltHeader, TableAltHeaderCell, TableAltBody, TableAltRow, TableAltCell } from '@Layout/TableAlternate/TableAlternate'
import InputText from '@Backend/Form/Input/InputText'
import Switch from '@Backend/Form/Switch/Switch'
import Button from '@Backend/Form/Button/Button'
import Grid from '@Layout/Grid/Grid'
import Hr from '@Backend/Element/Hr/Hr'
faker.locale = 'it'

export default {
  title: 'Backend/Layout/Page',
  component: Page,
}

const PageTemplate = props =>
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
    {props.children}
  </Page>

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
    <Grid columns="2">
      <InputText label="Titolo mega lungo da paura" placeholder="Ciaone" icon="shipping" />
      <InputText label="Descrizione" icon="uploadPhoto" filled={true} />
      <InputText label="Descrizione" filled={true} />
      <InputText label="Descrizione" />
      <Switch sChecked={true}>Questo libro ha codici per approfondimenti</Switch>
      <Button>Salva</Button>
    </Grid>
    <Hr/>
  </Page>

export const table = () =>
  <PageTemplate>
    <Table>
      <TableHeader>
        <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
        <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
        <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
        <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
        <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
        <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
        <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
        <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell><b>{faker.name.findName()}</b></TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell><b>{faker.name.findName()}</b></TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell><b>{faker.name.findName()}</b></TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </PageTemplate>

export const tableAlternate = () =>
  <PageTemplate>
    <TableAlternate>
      <TableAltHeader>
        <TableAltHeaderCell>{faker.database.column()}</TableAltHeaderCell>
        <TableAltHeaderCell>{faker.database.column()}</TableAltHeaderCell>
        <TableAltHeaderCell>{faker.database.column()}</TableAltHeaderCell>
        <TableAltHeaderCell>{faker.database.column()}</TableAltHeaderCell>
        <TableAltHeaderCell>{faker.database.column()}</TableAltHeaderCell>
        <TableAltHeaderCell>{faker.database.column()}</TableAltHeaderCell>
        <TableAltHeaderCell>{faker.database.column()}</TableAltHeaderCell>
        <TableAltHeaderCell>{faker.database.column()}</TableAltHeaderCell>
      </TableAltHeader>
      <TableAltBody>
        <TableAltRow>
          <TableAltCell><b>{faker.name.findName()}</b></TableAltCell>
          <TableAltCell><code>{faker.internet.email()}</code></TableAltCell>
          <TableAltCell>{faker.phone.phoneNumber()}</TableAltCell>
          <TableAltCell>{faker.company.companyName()}</TableAltCell>
          <TableAltCell>{faker.company.companyName()}</TableAltCell>
          <TableAltCell>{faker.company.companyName()}</TableAltCell>
          <TableAltCell>{faker.company.companyName()}</TableAltCell>
          <TableAltCell>{faker.company.companyName()}</TableAltCell>
        </TableAltRow>
        <TableAltRow>
          <TableAltCell><b>{faker.name.findName()}</b></TableAltCell>
          <TableAltCell><code>{faker.internet.email()}</code></TableAltCell>
          <TableAltCell>{faker.phone.phoneNumber()}</TableAltCell>
          <TableAltCell>{faker.company.companyName()}</TableAltCell>
          <TableAltCell>{faker.company.companyName()}</TableAltCell>
          <TableAltCell>{faker.company.companyName()}</TableAltCell>
          <TableAltCell>{faker.company.companyName()}</TableAltCell>
          <TableAltCell>{faker.company.companyName()}</TableAltCell>
        </TableAltRow>
        <TableAltRow>
          <TableAltCell><b>{faker.name.findName()}</b></TableAltCell>
          <TableAltCell><code>{faker.internet.email()}</code></TableAltCell>
          <TableAltCell>{faker.phone.phoneNumber()}</TableAltCell>
          <TableAltCell>{faker.company.companyName()}</TableAltCell>
          <TableAltCell>{faker.company.companyName()}</TableAltCell>
          <TableAltCell>{faker.company.companyName()}</TableAltCell>
          <TableAltCell>{faker.company.companyName()}</TableAltCell>
          <TableAltCell>{faker.company.companyName()}</TableAltCell>
        </TableAltRow>
      </TableAltBody>
    </TableAlternate>
  </PageTemplate>
