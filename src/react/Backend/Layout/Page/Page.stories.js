import React from 'react'
import faker from 'faker'

import PropTypes from 'prop-types'

import Menu, { MenuItem, MenuItemTitle, MenuItemAction } from '@Backend/Element/Menu/Menu'
import Page, { PageHeader, PageFooter } from '@Backend/Layout/Page/Page'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@Layout/Table/Table'
import InputText from '@Backend/Form/Input/InputText'
import Switch from '@Backend/Form/Switch/Switch'
import Button from '@Backend/Form/Button/Button'
import Grid from '@Layout/Grid/Grid'
import Hr from '@Backend/Element/Hr/Hr'
import Download from '@Element/Download/Download'
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

PageTemplate.propTypes = {
  title: PropTypes.string,
}

PageTemplate.defaultProps = {
  title: faker.internet.email(),
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
    <Grid columns="2">
      <InputText label="Titolo mega lungo da paura" placeholder="Ciaone" icon="shipping" required={true}/>
      <InputText label="Descrizione" icon="uploadPhoto" filled={true} />
      <InputText label="Descrizione" filled={true} />
      <InputText label="Descrizione" />
      <Switch sChecked={true}>Questo libro ha codici per approfondimenti</Switch>
      <Button>Salva</Button>
    </Grid>
    <Hr/>
  </Page>

export const table = () =>
  <PageTemplate title="Tabella con contenuti random">
    <Table>
      <TableHeader>
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
        </TableRow>
        <TableRow>
          <TableCell><b>{faker.name.findName()}</b></TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell><b>{faker.name.findName()}</b></TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </PageTemplate>

export const Allegati = () =>
  <PageTemplate title="File downloads">
    <Table interactive={true}>
      <TableHeader>
        <TableHeaderCell>File</TableHeaderCell>
        <TableHeaderCell>Categoria</TableHeaderCell>
        <TableHeaderCell>Creato</TableHeaderCell>
        <TableHeaderCell>Riscattato</TableHeaderCell>
        <TableHeaderCell>Azioni</TableHeaderCell>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            <Download fileName={faker.system.commonFileName()}/>
          </TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </PageTemplate>
