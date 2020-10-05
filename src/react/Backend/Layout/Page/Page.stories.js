import React from 'react'
import faker from 'faker'

import PropTypes from 'prop-types'

import Menu, { MenuItem, MenuItemTitle, MenuItemAction } from '@Backend/Element/Menu/Menu'
import Page, { PageHeader, PageFooter } from '@Backend/Layout/Page/Page'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@Layout/Table/Table'
import InputText from '@Backend/Form/Input/InputText'
import Switch from '@Backend/Form/Switch/Switch'
import Button from '@Backend/Form/Button/Button'
import Textarea from '@Backend/Form/Textarea/Textarea'
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
  <PageTemplate title="Volume">
    <Grid template="single-column-form">
      <Grid>
        <InputText label="Titolo" placeholder="Titolo del volume" icon="contentTitle" required={true}/>
        <Textarea label="Descrizione" placeholder="Inserisci una breve descrizione del volume" icon="contentDescription" required={true} />
        <InputText label="ISBN" placeholder="Un codice ISBN di 13 cifre" icon="isbn" required={true}/>
        <Switch sChecked={true}>Questo libro può ricevere codici per approfondimento</Switch>
        <Button>Salva</Button>
      </Grid>
    </Grid>
    <Hr/>
  </PageTemplate>

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
        <TableRow>
          <TableCell>
            <Download fileName={faker.system.commonFileName()}/>
          </TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Download fileName={faker.system.commonFileName()}/>
          </TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Download fileName={faker.system.commonFileName()}/>
          </TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
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
